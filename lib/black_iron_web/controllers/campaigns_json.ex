defmodule BlackIronWeb.CampaignsJSON do
  @moduledoc """
  JSON API for listing campaigns.
  """

  def index(assigns) do
    assigns[:campaigns]
  end
end
