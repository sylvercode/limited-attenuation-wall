import { WorkingArea, MasterWorkingArea, ContentEvaluator, SubWorkingArea } from "./working_area";

export type { ContentEvaluator, WorkingArea } from "./working_area";

export class WorkingAreaCache<T> {
    private masterParentArea: MasterWorkingArea<T>;

    private contentEvaluator: ContentEvaluator<T>;

    private cache: Map<string, WorkingArea<T>> = new Map();

    private areaOrderedBySurfaceArea: { area: WorkingArea<T>, surface: number }[] = [];

    constructor(globalContent: T, contentEvaluator: ContentEvaluator<T>) {
        this.masterParentArea = new MasterWorkingArea<T>(globalContent);
        this.contentEvaluator = contentEvaluator;
    }

    createWorkingArea(pt1: Canvas.Point, pt2: Canvas.Point, pt3: Canvas.Point): WorkingArea<T> {
        const rectArea = this.getRectangle(pt1, pt2, pt3);

        const key = `(${rectArea.x},${rectArea.y});(${rectArea.width},${rectArea.height})`;
        const cachedArea = this.cache.get(key);
        if (cachedArea)
            return cachedArea;

        const surface = rectArea.width * rectArea.height;

        const index = this.getIndexOfGreaterSurfaceArea(surface);
        const parent = (() => {
            if (index === -1)
                return this.masterParentArea;

            for (let i = index; i < this.areaOrderedBySurfaceArea.length; i++) {
                const { area } = this.areaOrderedBySurfaceArea[i];
                if (area.contains(rectArea))
                    return area;
            }

            return this.masterParentArea;
        })() //IIFE;

        const area = new SubWorkingArea<T>(rectArea, parent, this.contentEvaluator);
        this.addArea(key, { area, surface }, index);
        return area;
    }

    private getRectangle(pt1: Canvas.Point, pt2: Canvas.Point, pt3: Canvas.Point): PIXI.Rectangle {
        const minX = Math.min(pt1.x, pt2.x, pt3.x);
        const minY = Math.min(pt1.y, pt2.y, pt3.y);
        const maxX = Math.max(pt1.x, pt2.x, pt3.x);
        const maxY = Math.max(pt1.y, pt2.y, pt3.y);
        return new PIXI.Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    private addArea(key: string, areaEntry: { area: WorkingArea<T>, surface: number }, index: number) {
        this.cache.set(key, areaEntry.area);
        index = index < 0 ? this.areaOrderedBySurfaceArea.length : index;
        this.areaOrderedBySurfaceArea.splice(index, 0, areaEntry);
    }

    private getIndexOfGreaterSurfaceArea(surface: number): number {
        // If less than 10 elements, use linear search
        if (this.areaOrderedBySurfaceArea.length < 10)
            return this.areaOrderedBySurfaceArea.findIndex(a => a.surface > surface);

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

    traceLevels() {
        for (const area of this.areaOrderedBySurfaceArea.map(a => a.area).sort((a, b) => b.level() - a.level())) {
            console.log(`Level ${area.level()}`, area);
        }
    }
}
