export class Route {
  #regex: RegExp;

  constructor(route: string) {
    this.#regex = new RegExp(
      "^" +
        (route
          .split("/")
          .map((part) => {
            if (part.startsWith(":")) {
              return `(?<${part.slice(1)}>[^/]+)`;
            } else {
              return part;
            }
          })
          .join("/") || "/") +
        "$",
    );
    console.log("regexp", this.#regex);
  }

  match(path: string): RouteMatch | undefined {
    const match = this.#regex.exec(path);
    console.log("match", match);
    if (match) {
      return match.groups;
    }
  }
}

export interface RouteMatch {
  [key: string]: string;
}
