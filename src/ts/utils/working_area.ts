
export type ContentEvaluator<T> = (rect: PIXI.Rectangle, content: T) => T;

export abstract class WorkingArea<T> {
    protected rect: PIXI.Rectangle;

    constructor(rect: PIXI.Rectangle) {
        this.rect = rect;
    }

    public contains(rect: PIXI.Rectangle): boolean {
        return this.rect.contains(rect.x, rect.y) && this.rect.contains(rect.right - 1, rect.bottom - 1);
    }

    public abstract getContent(): T

    public abstract level(): number
}

export class SubWorkingArea<T> extends WorkingArea<T> {

    private parent: WorkingArea<T>;
    private contenteEvaluator: ContentEvaluator<T>;
    private content: T | null = null;

    constructor(rect: PIXI.Rectangle, parent: WorkingArea<T>, contenteEvaluator: ContentEvaluator<T>) {
        super(rect);
        this.parent = parent;
        this.contenteEvaluator = contenteEvaluator;
    }

    public override getContent(): T {
        if (!this.content) {
            this.content = this.contenteEvaluator(this.rect, this.parent.getContent());
            /*
            this.content = this.parent.getContent().filter(edge => {
                return this.rect.lineSegmentIntersects(edge.a, edge.b, { inside: true });
            });
            */
        }

        return this.content;
    }

    public override level(): number {
        return this.parent.level() + 1;
    }
}

export class MasterWorkingArea<T> extends WorkingArea<T> {
    private content: T;

    constructor(content: T) {
        super(new PIXI.Rectangle(-Infinity, -Infinity, Infinity, Infinity));
        this.content = content;
    }

    override getContent(): T {
        return this.content;
    }

    public override level(): number {
        return 0;
    }
}
