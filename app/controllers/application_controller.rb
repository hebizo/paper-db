class ApplicationController < ActionController::Base
  def index
    # This action serves as a catch-all for React Router
    render html: '', layout: true
  end
end
