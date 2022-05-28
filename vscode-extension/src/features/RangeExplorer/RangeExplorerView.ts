import { ALApp } from "../../lib/ALApp";
import { NinjaTreeView } from "../Explorer/NinjaTreeView";
import { RootNode } from "../Explorer/RootNode";
import { ViewController } from "../Explorer/ViewController";
import { RangeExplorerRootNode } from "./RangeExplorerRootNode";

// TODO Display any "no consumption yet" (and similar) nodes grayed out
// Also, propagate this decoration to their parents

// TODO Show individual IDs in range explorer, title = object id, description = file path
// When clicking on object id, opens the document and selects that id
// For any object consumed not by this repo, indicate with a different color that it comes from another repo
// For any such object, add commands:
// - "Investigate": checks if the object is in another branch, and if not, adds an "investigation token" in
//                  the back end that every other user will pick up and report back if they have this object
//                  in their repos, and if not, back end reports back and indicates that this object id is
//                  probably safe to release. For this we SHOULD keep name, date, time, of every object id
//                  assignment made through Ninja
// - "Release":     releases the ID in the back end and makes it available for re-assignment

// TODO Each node in range explorer should have a "lookup" action
// Clicking on this action takes the user to the section in app.json or objidconfig where that range is defined

export class RangeExplorerView extends NinjaTreeView {
    protected override createRootNode(app: ALApp, view: ViewController): RootNode {
        return new RangeExplorerRootNode(app, view);
    }
}
