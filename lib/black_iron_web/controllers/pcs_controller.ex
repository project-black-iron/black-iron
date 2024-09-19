defmodule BlackIronWeb.PCsController do
  use BlackIronWeb, :controller

  alias Ecto.Changeset
  alias BlackIron.Campaigns
  alias BlackIron.PCs
  alias BlackIron.Entities.Entity

  def insert_or_update(conn, params) do
    campaign = Campaigns.get_campaign(conn.assigns[:current_user], params["campaign_pid"])

    PCs.insert_or_update_pc(conn.assigns[:current_user], campaign, params["entity"])
    |> case do
      {:ok, pc} ->
        conn
        |> put_flash(:info, "PC created successfully.")
        |> redirect(
          to:
            ~p"/play/campaigns/#{params["campaign_pid"]}/#{params["cslug"]}/pcs/#{pc.pid}/#{Slug.slugify(pc.data.name)}"
        )

      {:error, :unathorized} ->
        conn
        |> put_flash(:error, "Unauthorized.")
        |> redirect(to: ~p"/play/campaigns/#{params["campaign_pid"]}/#{params["cslug"]}")

      {:error, %Changeset{} = changeset} ->
        conn
        |> put_flash(:error, "Error creating PC.")
        |> render(:new, changeset: changeset)
    end
  end

  def index(conn, params) do
    campaign = Campaigns.get_campaign(conn.assigns[:current_user], params["campaign_pid"])
    pcs = PCs.list_pcs_for_campaign(conn.assigns[:current_user], campaign)
    render(conn, :index, campaign: campaign, pcs: pcs)
  end

  def new(conn, params) do
    campaign =
      Campaigns.get_campaign(
        conn.assigns[:current_user],
        params["campaign_pid"]
      )

    render(conn, :new,
      campaign_pid: params["campaign_pid"],
      cslug: params["cslug"],
      campaign: campaign,
      changeset: PCs.change_pc(%Entity{}, %{})
    )
  end

  def show(conn, params) do
    campaign =
      Campaigns.get_campaign(
        conn.assigns[:current_user],
        params["campaign_pid"]
      )

    pc =
      PCs.get_pc(conn.assigns[:current_user], campaign, params["pc_pid"])

    render(conn, :show,
      campaign_pid: params["campaign_pid"],
      cslug: params["cslug"],
      pc_pid: params["pc_pid"],
      pc_slug: params["slug"],
      campaign: campaign,
      pc: pc,
      changeset: PCs.change_pc(pc || %Entity{}, %{})
    )
  end
end
