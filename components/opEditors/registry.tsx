import type { OperationEditors } from "./common";
import FilterByKeyEditor from "./FilterByKeyEditor";
import RenameKeyEditor from "./RenameKeyEditor";
import ExtractPathEditor from "./ExtractPathEditor";
import StringReplaceEditor from "./StringReplaceEditor";
import RegexReplaceEditor from "./RegexReplaceEditor";
import TrimStringsEditor from "./TrimStringsEditor";
import CoerceTypeEditor from "./CoerceTypeEditor";
import TemplateInterpolateEditor from "./TemplateInterpolateEditor";
import Base64Editor from "./Base64Editor";
import StringCaseEditor from "./StringCaseEditor";
import { FilterArrayEditor, SortArrayEditor, UniqueArrayEditor, FlattenArrayEditor, SliceArrayEditor, GroupByEditor, ReduceArrayEditor, CountArrayEditor, JoinArrayEditor } from "./ArrayEditors";
import { AggregationEditor, ClampEditor, RoundEditor, ScalarMathEditor } from "./MathEditors";
import { IfEditor, SwitchEditor } from "./ControlEditors";
import { ValidateJSONEditor } from "./ValidationEditors";
import { NormalizeKeyCaseEditor, OmitPathsEditor, PickPathsEditor, RenameKeysByPatternEditor, SetPathEditor, DeletePathEditor, MergeAtPathEditor, FlattenObjectEditor, UnflattenObjectEditor } from "./ObjectEditors";
import { ParseDateEditor, IsDateCompareEditor, DateAddEditor, DateDiffEditor } from "./DateEditors";

export const editors: OperationEditors = {
  // Object
  FilterByKey: FilterByKeyEditor,
  RenameKey: RenameKeyEditor,
  ExtractPath: ExtractPathEditor,
  RenameKeysByPattern: RenameKeysByPatternEditor,
  NormalizeKeyCase: NormalizeKeyCaseEditor,
  PickPaths: PickPathsEditor,
  OmitPaths: OmitPathsEditor,
  SetPath: SetPathEditor,
  DeletePath: DeletePathEditor,
  MergeAtPath: MergeAtPathEditor,
  FlattenObject: FlattenObjectEditor,
  UnflattenObject: UnflattenObjectEditor,

  // Array
  FilterArray: FilterArrayEditor,
  SortArray: SortArrayEditor,
  UniqueArray: UniqueArrayEditor,
  FlattenArray: FlattenArrayEditor,
  SliceArray: SliceArrayEditor,
  GroupBy: GroupByEditor,
  ReduceArray: ReduceArrayEditor,
  CountArray: CountArrayEditor,
  JoinArray: JoinArrayEditor,

  // String
  StringReplace: StringReplaceEditor,
  RegexReplace: RegexReplaceEditor,
  TrimStrings: TrimStringsEditor,
  CoerceType: CoerceTypeEditor,
  TemplateInterpolate: TemplateInterpolateEditor,
  Base64: Base64Editor,
  StringCase: StringCaseEditor,

  // Math
  Add: ScalarMathEditor,
  Subtract: ScalarMathEditor,
  Multiply: ScalarMathEditor,
  Divide: ScalarMathEditor,
  Modulo: ScalarMathEditor,
  Power: ScalarMathEditor,
  Round: RoundEditor,
  Clamp: ClampEditor,
  Sum: AggregationEditor,
  Count: AggregationEditor,
  Min: AggregationEditor,
  Max: AggregationEditor,
  // Control
  If: IfEditor,
  Switch: SwitchEditor,
  // Validation
  ValidateJSON: ValidateJSONEditor,
  // Date operations
  ParseDate: ParseDateEditor,
  IsDateCompare: IsDateCompareEditor,
  DateAdd: DateAddEditor,
  DateDiff: DateDiffEditor,
};
