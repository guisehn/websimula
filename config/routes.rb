Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }

  root to: 'home#index'

  resources :projects do
    resources :users
    resources :simulations, except: [:edit, :update]
    resources :variables, except: [:index, :show]

    resources :agents, except: [:index, :show] do
      resources :rules, except: [:index, :show]
    end

    member do
      get 'agents'
      get 'stop_condition'
      get 'stop_condition/edit', to: 'projects#edit_stop_condition', as: 'edit_stop_condition'
      get 'initial_positions'
      get 'initial_positions/edit', to: 'projects#edit_initial_positions', as: 'edit_initial_positions'
      get 'variables'
    end
  end
end
