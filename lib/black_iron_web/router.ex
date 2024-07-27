defmodule BlackIronWeb.Router do
  use BlackIronWeb, :router

  import BlackIronWeb.UserAuth

  @doc """
  Gets the list of paths that a service worker should precache.
  """
  def get_service_worker_paths do
    static_dir = Path.expand(Path.join(__DIR__, "../../priv/static/"))
    static_len = String.length(static_dir)
    Phoenix.Router.routes(BlackIronWeb.Router)
    |> Enum.filter(&(&1[:verb] == :get))
    |> Enum.map(&Phoenix.Router.route_info(BlackIronWeb.Router, "GET", &1[:path], ""))
    |> Enum.filter(&(Enum.empty?(&1[:path_params]) && Enum.member?(&1[:pipe_through], :service_worker)))
    |> Enum.map(&(&1[:route]))
    |> Enum.concat(
      Path.wildcard(Path.join(static_dir, "**/*"))
      |> Enum.filter(&File.regular?/1)
      |> Enum.map(&(String.slice(&1, static_len..(String.length(&1)))))
      )
  end

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {BlackIronWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
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

  scope "/", BlackIronWeb do
    pipe_through [:browser, :service_worker]

    get "/", PageController, :home
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
    pipe_through [:browser, :redirect_if_user_is_authenticated, :service_worker]

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
    pipe_through [:browser, :require_authenticated_user, :service_worker]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/", BlackIronWeb do
    pipe_through [:browser]

    delete "/users/log_out", UserSessionController, :delete
    get "/users/confirm", UserConfirmationController, :new
    post "/users/confirm", UserConfirmationController, :create
    get "/users/confirm/:token", UserConfirmationController, :edit
    post "/users/confirm/:token", UserConfirmationController, :update
  end
end
