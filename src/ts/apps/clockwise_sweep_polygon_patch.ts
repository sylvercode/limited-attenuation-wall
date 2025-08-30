import type { LibWrapperBaseCallback, LibWrapperBaseCallbackArgs, LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { LimitedAttenuationWallFlagsDataModel } from "./limited_attenuation_wall_flags_data_model";


export default class ClockwiseSweepPolygonPatch {

    static readonly LIBWRAPPER_PATCHS: LibWrapperWrapperDefinitions[] = [
        {
            target: "foundry.canvas.geometry.ClockwiseSweepPolygon.prototype._identifyEdges",
            fn: ClockwiseSweepPolygonPatch.identifyEdges_Wrapper,
            type: "WRAPPER"
        }
    ];

    /**
     * 
     * @param this The ClockwiseSweepPolygon instance
     * @param wrapped The base wrapped function
     * @param args The arguments of the wrapped function
     * @returns the result of the wrapped function
     */
    static identifyEdges_Wrapper(this: ClockwiseSweepPolygon, wrapped: LibWrapperBaseCallback, ...args: LibWrapperBaseCallbackArgs): any {
        const result = wrapped.apply(this, args);
        ClockwiseSweepPolygonPatch._identifyEdges.call(this);
        return result;
    }


    static _identifyEdges(this: ClockwiseSweepPolygon): void {
        const edgesUpdates = [];
        for (const edge of this.edges) {
            if (!(edge.object?.document instanceof WallDocument)) continue;
            const dataModel = new LimitedAttenuationWallFlagsDataModel(edge.object.document);
            if (!dataModel.hasLimitedAttenuation || !dataModel.limitedAttenuationRatio) continue;
            const attenuationRatio = dataModel.limitedAttenuationRatio;
            if (edge.sight !== CONST.WALL_SENSE_TYPES.LIMITED) continue;
            const compute = (point: 'a' | 'b') => {
                const testPoint = edge[point];
                const XRay = new foundry.canvas.geometry.Ray({ x: this.origin.x, y: this.origin.y }, { x: testPoint.x, y: testPoint.y });
                const edgeOnPath = [];
                for (const otherEdge of this.edges) {
                    if (otherEdge === edge) continue;
                    if (otherEdge.a.x === testPoint.x && otherEdge.a.y === testPoint.y) continue;
                    if (otherEdge.b.x === testPoint.x && otherEdge.b.y === testPoint.y) continue;
                    const intersection = XRay.intersectSegment([otherEdge.a.x, otherEdge.a.y, otherEdge.b.x, otherEdge.b.y]);
                    if (!intersection) continue;
                    edgeOnPath.push({
                        edge: otherEdge,
                        intersection: intersection
                    });
                }

                if (edgeOnPath.length === 0) return;
                const firstEdge = edgeOnPath.reduce((max, curr) => {
                    return (curr.intersection.t0 > max.intersection.t0) ? curr : max;
                }, edgeOnPath[0]);
                if (firstEdge.edge.sight !== CONST.WALL_SENSE_TYPES.LIMITED) return;
                const XRay2 = new foundry.canvas.geometry.Ray(testPoint, firstEdge.intersection);
                const midPoint = XRay2.project(attenuationRatio);
                return {
                    edge,
                    point,
                    newPoint: { x: midPoint.x, y: midPoint.y }
                }
            }
            const updateA = compute('a');
            if (updateA) edgesUpdates.push(updateA);
            const updateB = compute('b');
            if (updateB) edgesUpdates.push(updateB);
        }

        for (const update of edgesUpdates) {
            const edge = update.edge;
            const point = update.point;
            const newPoint = update.newPoint;

            if (point === 'a') {
                edge.a.x = newPoint.x;
                edge.a.y = newPoint.y;
            } else if (point === 'b') {
                edge.b.x = newPoint.x;
                edge.b.y = newPoint.y;
            }
        }
    }
}
