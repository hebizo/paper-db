class Api::PapersController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @papers = Paper.all
    render json: @papers.as_json(only: [:id, :title, :memo], include: { authors: { only: :name }, tags: { only: :name } })
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
    @paper = Paper.find(params[:id])
    
    if @paper.update(paper_params)
      # 既存の関連を一旦削除
      @paper.authors.clear
      @paper.tags.clear

      # 新しい著者を追加
      if params[:authors].present?
        params[:authors].each do |author_param|
          author = Author.find_or_create_by(name: author_param["name"])
          @paper.authors << author
        end
      end

      # 新しいタグを追加
      if params[:tags].present?
        params[:tags].each do |tag_param|
          tag = Tag.find_or_create_by(name: tag_param["name"])
          @paper.tags << tag
        end
      end

      render json: @paper.as_json(include: { authors: { only: :name }, tags: { only: :name } })
    else
      render json: @paper.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @paper = Paper.find(params[:id])
    @paper.destroy
    head :no_content
  end

  private
  def paper_params
    params.require(:paper).permit(:title, :url, :memo)
  end
end
