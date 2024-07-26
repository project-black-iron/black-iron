// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
import "./user_socket.js";

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
import { Socket } from "phoenix";
// import topbar from "../vendor/topbar"

class BlackIronApp {
  // >> socket.enableDebug()
  // >> socket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> socket.disableLatencySim()
  socket?: Socket;

  connect() {
    this.socket = new Socket("/socket", {
      longPollFallbackMs: 2500,
      params: { token: (window as any).userToken },
    });
    this.socket.connect();
  }

  joinCampaign(room: string) {
    if (!this.socket) {
      this.connect();
    }
    let channel = this.socket!.channel("campaign_sync:" + room, {});
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  }
}

(window as any).blackIronApp = new BlackIronApp();

// Show progress bar on live navigation and form submits
// topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
// window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
// window.addEventListener("phx:page-loading-stop", _info => topbar.hide())
