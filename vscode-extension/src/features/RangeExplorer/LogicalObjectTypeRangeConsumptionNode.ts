import { Uri, ThemeIcon, TreeItemCollapsibleState } from "vscode";
import { ALObjectType } from "../../lib/types/ALObjectType";
import { NinjaALRange } from "../../lib/types/NinjaALRange";
import { AppAwareNode } from "../Explorer/AppAwareNode";
import { Node } from "../Explorer/Node";
import { getSeverityFromRemaining, severityIconMap } from "../Explorer/TreeItemDecoration";
import { ObjectTypeNode } from "./ObjectTypeNode";
import { RangeNode } from "./RangeNode";

export class LogicalObjectTypeRangeConsumptionNode extends RangeNode {
    protected override readonly _includeLogicalNameInDescription = false;
    protected override readonly _includeLogicalNameInLabel: boolean;
    protected override _collapsibleState = TreeItemCollapsibleState.None;

    constructor(parent: AppAwareNode, objectType: string, range: NinjaALRange, includeName: boolean) {
        super(parent, range);
        this._includeLogicalNameInLabel = includeName;

        const objConsumption = this._consumption[objectType as ALObjectType] || [];
        const ids = objConsumption.filter(id => id >= range.from && id <= range.to);
        const size = range.to - range.from + 1;
        const remaining = size - ids.length;
        const pct = Math.round((ids.length / size) * 100);
        const severity = getSeverityFromRemaining(remaining);

        this._iconPath = new ThemeIcon(severityIconMap[severity] || "check");
        this._tooltip = `${ids.length} assigned ${objectType} object(s), ${remaining} available`;
        this._description = `${pct}% (${ids.length} of ${size})`;

        this._decoration = {};
        // TODO Add decoration
        // decoration:
        //     remaining > 10
        //         ? undefined
        //         : {
        //               badge: `${remaining}`,
        //               propagate: true,
        //               severity,
        //           },
    }

    protected override getChildren(): Node[] {
        // This node type has no children, but parent does
        return [];
    }
}
