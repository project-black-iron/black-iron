export class Route {
  #regex: RegExp;

  constructor(route: string) {
    this.#regex = new RegExp(
      "^"
        + (route
          .split("/")
          .map((part) => {
            if (part.startsWith(":")) {
              return `(?<${part.slice(1)}>[^/]+)`;
            } else {
              return part;
            }
          })
          .join("/") || "/")
        + "$",
    );
  }

  match(path: string): RouteMatch | undefined {
    return this.#regex.exec(path)?.groups;
  }
}

export interface RouteMatch {
  [key: string]: string;
}
