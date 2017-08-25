Rails.application.routes.draw do
  devise_for :users

  root to: 'home#index'

  resources :projects do
    resources :users
    resources :agents, except: [:index, :show]

    member do
      get 'agents'
      get 'variables'
    end
  end
end
