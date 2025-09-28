Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines rails API routes
  namespace :api, defaults: { format: :json } do
    resources :papers, except: [:new, :edit] do
      get :pdf, on: :member
    end
  end
  
  # for react-router 
  get '*path', to: 'application#index', via: :all
end
