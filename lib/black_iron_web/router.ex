defmodule BlackIronWeb.Router do
  use BlackIronWeb, :router

  import BlackIronWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {BlackIronWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
    plug BlackIronWeb.Plugs.Locale, "en"
    plug :put_user_token
  end

  defp put_user_token(conn, _) do
    if current_user = conn.assigns[:current_user] do
      token = Phoenix.Token.sign(conn, "user socket", current_user.id)
      assign(conn, :user_token, token)
    else
      conn
    end
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :service_worker do
  end

  pipeline :app do
    plug :put_layout, html: {BlackIronWeb.Layouts, :app}
  end

  pipeline :site do
    plug :put_layout, html: {BlackIronWeb.Layouts, :site}
  end

  scope "/", BlackIronWeb do
    pipe_through [:browser, :site, :service_worker]

    get "/", PageController, :home
    get "/offline", OfflineController, :site
  end

  scope "/", BlackIronWeb do
    pipe_through [:api, :app]

    get "/offline_paths", OfflineController, :offline_paths
  end

  # Other scopes may use custom stacks.
  # scope "/api", BlackIronWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:black_iron, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: BlackIronWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Authentication routes

  scope "/", BlackIronWeb do
    pipe_through [:browser, :site, :redirect_if_user_is_authenticated]

    get "/users/register", UserRegistrationController, :new
    post "/users/register", UserRegistrationController, :create
    get "/users/log_in", UserSessionController, :new
    post "/users/log_in", UserSessionController, :create
    get "/users/reset_password", UserResetPasswordController, :new
    post "/users/reset_password", UserResetPasswordController, :create
    get "/users/reset_password/:token", UserResetPasswordController, :edit
    put "/users/reset_password/:token", UserResetPasswordController, :update
  end

  scope "/", BlackIronWeb do
    pipe_through [:browser, :site, :require_authenticated_user]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/", BlackIronWeb do
    pipe_through [:browser, :site]

    delete "/users/log_out", UserSessionController, :delete
    get "/users/confirm", UserConfirmationController, :new
    post "/users/confirm", UserConfirmationController, :create
    get "/users/confirm/:token", UserConfirmationController, :edit
    post "/users/confirm/:token", UserConfirmationController, :update
  end

  scope "/campaigns", BlackIronWeb do
    pipe_through [:browser, :app, :service_worker]

    get "/", CampaignsController, :show
    get "/world", WorldController, :show
    get "/npcs", NPCsController, :show
    get "/lore", LoreController, :show
    get "/tracks", TracksController, :show
    get "/journals", JournalsController, :show
    get "/character", CharacterSheetController, :show
  end
end
