defmodule BlackIronWeb.PCsController do
  use BlackIronWeb, :controller

  alias BlackIron.Campaigns
  alias BlackIron.PCs
  alias BlackIron.Entities.Entity

  def index(conn, params) do
    campaign = Campaigns.get_campaign(conn.assigns[:current_user], params["campaign_pid"])
    pcs = PCs.list_pcs_for_campaign(conn.assigns[:current_user], campaign)
    render(conn, :index, campaign: campaign, pcs: pcs)
  end

  def show(conn, params) do
    campaign =
      Campaigns.get_campaign(
        conn.assigns[:current_user],
        params["campaign_pid"]
      )

    pc =
      PCs.get_pc(conn.assigns[:current_user], campaign, params["pc_pid"])

    changeset = PCs.change_pc(%Entity{}, pc || %{})

    render(conn, :show,
      campaign_pid: params["campaign_pid"],
      cslug: params["cslug"],
      campaign: campaign,
      pc: pc || %{},
      changeset: changeset,
      form: Phoenix.Component.to_form(changeset, as: "pc")
    )
  end
end
