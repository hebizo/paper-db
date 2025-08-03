class Api::PapersController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @papers = Paper.all
    # TODO: Render the papers as JSON
  end

  def create
    @paper = Paper.new(paper_params)

    if @paper.save
      if params[:tags].present?
        params[:tags].each do |tag_name|
          tag = Tag.find_or_create_by(name: tag_name)
          @paper.tags << tag
        end
      end

      if params[:authors].present?
        params[:authors].each do |author_name|
          author = Author.find_or_create_by(name: author_name)
          @paper.authors << author
        end
      end

      render json: @paper, status: :created
    else
      render json: @paper.errors, status: :unprocessable_entity
    end
  end

  def show
    @paper = Paper.find(params[:id])
    render json: @paper.as_json(include: { authors: { only: :name } , tags: { only: :name } })
  end

  def update
    
  end

  def destroy
    
  end

  private
  def paper_params
    params.require(:paper).permit(:title, :url, :memo)
  end
end
