Rails.application.routes.draw do
  devise_for :users

  root to: 'home#index'

  resources :projects do
    resources :users

    member do
      get 'agents'
    end
  end
end
