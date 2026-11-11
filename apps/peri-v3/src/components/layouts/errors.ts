/** Thrown by a layout context hook that is used outside of its provider */
export class OutsideProviderError extends Error {
  hook: string;
  provider: string;

  constructor(hook: string, provider: string) {
    super(`${hook} must be used within a <${provider} />`);
    this.hook = hook;
    this.provider = provider;
  }
}

/** Thrown when a second PagerViewport mounts, embla has only one viewport */
export class DuplicatePagerViewportError extends Error {
  constructor() {
    super("only one <PagerViewport /> can be mounted at a time");
  }
}
