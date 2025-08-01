import DogBrowser from "./apps/dogBrowser";

export interface MyModule extends foundry.packages.Module {
  dogBrowser: DogBrowser;
}
