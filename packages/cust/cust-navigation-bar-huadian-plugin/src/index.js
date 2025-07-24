import { createPlugin } from "opp-tools"
import { mount, unmount } from "./utils"
import Render from "@/components/render"

const plugin = {
  name: "cust-navigation-bar-huadian-plugin",
  method: "insert",
  mount,
  unmount,
  container: "placeholder/test",
  dependencies: [
    "store-ide",
    "store-app",
    "skeleton"
  ]
}

export default createPlugin(Render)(plugin)
