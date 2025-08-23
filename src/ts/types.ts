import ClockwiseSweepPolygonPatch from "./clockwise_sweep_polygon_patch";
import * as dogBrowserApp from "./apps/dog_browser";
import type { LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { HookDefinitions } from "fvtt-hook-attacher";

export interface SylvercodeEnhanceLimitedWallModule
  extends foundry.packages.Module, dogBrowserApp.DogBrowserHandle {

}

export type OnInitModuleFunc = (module: SylvercodeEnhanceLimitedWallModule) => void;

export class SylvercodeEnhanceLimitedWallModuleHooks {
  static ON_INIT_MODULE_CALLBACKS: Iterable<OnInitModuleFunc> = [
    dogBrowserApp.onInitHandle,
  ];

  static LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = Array.from(
    ClockwiseSweepPolygonPatch.LIBWRAPPER_PATCHS,
  );

  static HOOKS_DEFINITIONS: HookDefinitions = {
    ...dogBrowserApp.HOOKS_DEFINITIONS,
  }
}
