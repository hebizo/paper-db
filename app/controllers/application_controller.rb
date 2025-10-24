class ApplicationController < ActionController::Base
  def index
    # This action serves as a catch-all for React Router.
    # Force HTML so any JSON or other format requests still get the SPA shell.
    request.format = :html
    render html: '', layout: 'application', content_type: 'text/html'
  end
end
