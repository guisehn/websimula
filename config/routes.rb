Rails.application.routes.draw do
  devise_for :users

  root to: 'home#index'

  resources :projects do
    resources :users
    resources :agents, except: [:index, :show]
    resources :variables, except: [:index, :show]
    resources :simulations, except: [:edit, :update]

    member do
      get 'agents'
      get 'variables'
    end
  end
end
