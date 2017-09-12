Rails.application.routes.draw do
  devise_for :users

  root to: 'home#index'

  resources :projects do
    resources :users
    resources :variables, except: [:index, :show]
    resources :simulations, except: [:edit, :update]

    resources :agents, except: [:index, :show] do
      resources :rules, except: [:index, :show]
    end

    member do
      get 'agents'
      get 'variables'
    end
  end
end
