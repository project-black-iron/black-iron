defmodule BlackIron.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `BlackIron.Accounts` context.
  """

  def unique_user_email, do: "user#{System.unique_integer()}@example.com"

  def unique_handle do
    string = "#{System.unique_integer()}" |> String.reverse() |> String.slice(0, 12)
    "user#{string}"
  end

  def valid_user_password, do: "hello world!"

  def valid_user_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
      email: unique_user_email(),
      handle: unique_handle(),
      password: valid_user_password()
    })
  end

  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> valid_user_attributes()
      |> BlackIron.Accounts.register_user()

    user
  end

  def extract_user_token(fun) do
    {:ok, captured_email} = fun.(&"[TOKEN]#{&1}[TOKEN]")
    [_, token | _] = String.split(captured_email.text_body, "[TOKEN]")
    token
  end
end
