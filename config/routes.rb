Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }

  root to: 'home#index'
  get '/robots.txt' => 'home#robots_txt'

  resources :projects do
    resources :users
    resources :simulations, except: [:edit, :update]
    resources :variables, except: [:index, :show]

    resources :agents, except: [:index] do
      resources :rules, except: [:show]
    end

    collection do
      get 'open'
      get 'all'
      get 'tutorial'
    end

    member do
      get 'agents'
      get 'stop_condition'
      get 'stop_condition/edit', to: 'projects#edit_stop_condition', as: 'edit_stop_condition'
      get 'initial_positions'
      get 'initial_positions/edit', to: 'projects#edit_initial_positions', as: 'edit_initial_positions'
      get 'variables'

      post 'fork'

      put 'first_access'
    end
  end
end
