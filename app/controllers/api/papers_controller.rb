class Api::PapersController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_paper, only: [:show, :update, :destroy, :pdf]

  def index
    papers = Paper.includes(:authors, :tags, :paper_document)
    render json: papers.map { |paper| paper_payload(paper, summary: true) }
  end

  def create
    @paper = Paper.new(paper_params)

    ActiveRecord::Base.transaction do
      unless @paper.save
        render json: @paper.errors, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end

      sync_associations(@paper)

      unless handle_pdf_upload(@paper)
        render json: @paper.errors, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end
    end
    return if performed?

    render json: paper_payload(@paper), status: :created
  end

  def show
    render json: paper_payload(@paper)
  end

  def update
    ActiveRecord::Base.transaction do
      unless @paper.update(paper_params)
        render json: @paper.errors, status: :unprocessable_entity
        return
      end

      sync_associations(@paper)

      unless handle_pdf_upload(@paper)
        render json: @paper.errors, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end
    end
    return if performed?

    render json: paper_payload(@paper)
  end

  def pdf
    document = @paper.paper_document

    if document&.pdf_data.present?
      send_data document.pdf_data, filename: document.pdf_filename, type: document.pdf_content_type, disposition: 'inline'
    else
      head :not_found
    end
  end

  def destroy
    @paper.destroy
    head :no_content
  end

  private

  def set_paper
    @paper = Paper.includes(:authors, :tags, :paper_document).find(params[:id])
  end

  def paper_params
    params.require(:paper).permit(:title, :url, :memo)
  end

  def sync_associations(paper)
    paper.authors = author_names.map { |name| Author.find_or_create_by!(name: name) }
    paper.tags = tag_names.map { |name| Tag.find_or_create_by!(name: name) }
  end

  def author_names
    extract_names(params[:authors])
  end

  def tag_names
    extract_names(params[:tags])
  end

  def extract_names(raw)
    result = case raw
              when nil
                []
              when String
                raw.split(/[,、]/).map(&:strip)
              when Array
                raw.flat_map { |value| extract_names(value) }
              when ActionController::Parameters
                extract_names(raw.to_unsafe_h)
              when Hash
                if raw.key?(:name) || raw.key?('name')
                  extract_names(raw[:name] || raw['name'])
                else
                  raw.values.flat_map { |value| extract_names(value) }
                end
              else
                []
              end

    result.map { |value| value.to_s.strip }.reject(&:blank?).uniq
  end

  def handle_pdf_upload(paper)
    remove_requested = ActiveModel::Type::Boolean.new.cast(params[:remove_pdf])

    if remove_requested && paper.paper_document
      paper.paper_document.destroy
      paper.association(:paper_document).reset
    end

    uploaded_file = params[:pdf_file]
    return true unless uploaded_file

    document = paper.paper_document || paper.build_paper_document
    document.pdf_filename = uploaded_file.original_filename
    document.pdf_content_type = resolved_content_type(uploaded_file)
    document.pdf_byte_size = uploaded_file.respond_to?(:size) ? uploaded_file.size : uploaded_file.tempfile.size
    document.pdf_data = uploaded_file.read
    uploaded_file.rewind if uploaded_file.respond_to?(:rewind)

    if document.save
      true
    else
      paper.errors.merge!(document.errors)
      false
    end
  end

  def resolved_content_type(uploaded_file)
    return uploaded_file.content_type if uploaded_file.respond_to?(:content_type) && uploaded_file.content_type.present?

    original_filename = uploaded_file.original_filename.to_s
    return 'application/pdf' if File.extname(original_filename).casecmp('.pdf').zero?

    uploaded_file.respond_to?(:content_type) ? uploaded_file.content_type : nil
  end

  def paper_payload(paper, summary: false)
    include_hash = { authors: { only: :name }, tags: { only: :name } }
    payload = if summary
                paper.as_json(only: [:id, :title, :memo], include: include_hash)
              else
                paper.as_json(include: include_hash)
              end
    payload['pdf'] = paper_document_payload(paper)
    payload
  end

  def paper_document_payload(paper)
    document = paper.paper_document
    return nil unless document

    {
      'filename' => document.pdf_filename,
      'byte_size' => document.pdf_byte_size,
      'content_type' => document.pdf_content_type,
      'url' => pdf_api_paper_path(paper)
    }
  end
end
