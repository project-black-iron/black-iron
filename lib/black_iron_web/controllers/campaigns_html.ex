defmodule BlackIronWeb.CampaignsHTML do
  @moduledoc """
  HTML view for /play/campaigns
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Campaigns list</h3>
    <bi-campaign-list campaigns={Jason.encode!(assigns[:campaigns])}></bi-campaign-list>
    """
  end

  def show(assigns) do
    ~H"""
    <h3>Campaign <%= assigns[:campaignId] %></h3>
    <p>Details about Campaign <%= assigns[:campaignId] %></p>
    <p><a href="/play/campaigns">Back to campaigns list</a></p>
    """
  end
end
