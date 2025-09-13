import { WorkingArea, MasterWorkingArea, ContentEvaluator, SubWorkingArea } from "./working_area";

export type { ContentEvaluator, WorkingArea } from "./working_area";

/**
 * Caches and manages hierarchical working areas for a given content type.
 * @template T The type of content managed by the working areas.
 */
export class WorkingAreaCache<T> {
    /**
     * The root working area covering the entire space.
     */
    private readonly masterParentArea: MasterWorkingArea<T>;
    /**
     * Cache mapping area keys to their corresponding working areas.
     */
    private readonly cache: Map<string, WorkingArea<T>> = new Map();
    /**
     * List of areas ordered by their surface area.
     */
    private readonly areaOrderedBySurfaceArea: { area: WorkingArea<T>; surface: number }[] = [];

    /**
     * Creates a new WorkingAreaCache.
     * @param globalContent The initial content for the master area.
     * @param contentEvaluator Function to evaluate content for sub-areas.
     */
    constructor(globalContent: T,
        private readonly contentEvaluator: ContentEvaluator<T>) {
        this.masterParentArea = new MasterWorkingArea<T>(globalContent);
    }

    /**
     * Creates or retrieves a cached working area defined by three points.
     * @param pt1 First point.
     * @param pt2 Second point.
     * @param pt3 Third point.
     * @returns The corresponding WorkingArea instance.
     */
    createWorkingArea(pt1: Canvas.Point, pt2: Canvas.Point, pt3: Canvas.Point): WorkingArea<T> {
        const rectArea = this.getRectangle(pt1, pt2, pt3);
        const key = `(${rectArea.x},${rectArea.y});(${rectArea.width},${rectArea.height})`;
        const cachedArea = this.cache.get(key);
        if (cachedArea) {
            return cachedArea;
        }
        const surface = rectArea.width * rectArea.height;
        const index = this.getIndexOfGreaterSurfaceArea(surface);
        const parent = (() => {
            if (index === -1) {
                return this.masterParentArea;
            }
            for (let i = index; i < this.areaOrderedBySurfaceArea.length; i++) {
                const { area } = this.areaOrderedBySurfaceArea[i];
                if (area.contains(rectArea)) {
                    return area;
                }
            }
            return this.masterParentArea;
        })(); // IIFE
        const area = new SubWorkingArea<T>(rectArea, parent, this.contentEvaluator);
        this.addArea(key, { area, surface }, index);
        return area;
    }

    /**
     * Computes the bounding rectangle for three points.
     * @param pt1 First point.
     * @param pt2 Second point.
     * @param pt3 Third point.
     * @returns The bounding PIXI.Rectangle.
     */
    private getRectangle(pt1: Canvas.Point, pt2: Canvas.Point, pt3: Canvas.Point): PIXI.Rectangle {
        const minX = Math.min(pt1.x, pt2.x, pt3.x);
        const minY = Math.min(pt1.y, pt2.y, pt3.y);
        const maxX = Math.max(pt1.x, pt2.x, pt3.x);
        const maxY = Math.max(pt1.y, pt2.y, pt3.y);
        return new PIXI.Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * Adds a new area to the cache and the surface ordered list.
     * @param key The cache key for the area.
     * @param areaEntry The area and its surface.
     * @param index The index to insert at in the surface ordered list.
     */
    private addArea(key: string, areaEntry: { area: WorkingArea<T>; surface: number }, index: number): void {
        this.cache.set(key, areaEntry.area);
        index = index < 0 ? this.areaOrderedBySurfaceArea.length : index;
        this.areaOrderedBySurfaceArea.splice(index, 0, areaEntry);
    }

    /**
     * Finds the index of the first area with a greater surface area in surface ordered list.
     * Uses linear search for small lists, binary search otherwise.
     * @param surface The surface area to compare.
     * @returns The index, or -1 if none found.
     */
    private getIndexOfGreaterSurfaceArea(surface: number): number {
        // If less than 10 elements, use linear search
        if (this.areaOrderedBySurfaceArea.length < 10) {
            return this.areaOrderedBySurfaceArea.findIndex(a => a.surface > surface);
        }
        // Otherwise, use binary search for the first index where a.surface > surface
        let left = 0;
        let right = this.areaOrderedBySurfaceArea.length - 1;
        let result = -1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this.areaOrderedBySurfaceArea[mid].surface > surface) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result;
    }

    /**
     * Logs the levels of all cached areas, ordered by level descending.
     */
    traceLevels(): void {
        for (const area of this.areaOrderedBySurfaceArea.map(a => a.area).sort((a, b) => b.level() - a.level())) {
            console.log(`Level ${area.level()}`, area);
        }
    }
}
