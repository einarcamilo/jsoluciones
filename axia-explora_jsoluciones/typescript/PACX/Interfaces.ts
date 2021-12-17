interface IAffectationResponse{
  Id: number;
  Kpi: string;
  Operation: string;
  Channel: string;
  Ally: string;
}
export interface IFinding{
  Id: number;
  Name: string;
  Description: string;
  Impact: string;
  State: number;
  Cause: number;
  Identification_date: Date;
  Created_by: string;
}
export interface IElement{
  Id: number;
  Name: string;
  Description: string;
}
export interface IPlan{
  Affectation: IAffectationResponse;
  Findings: Array<IFinding>;
  Options: Array<IElement>;
}
export interface IFindings{
  Actions: Array<IActionDetail>;
  Finding:IFinding;
  Options: Array<IElement>;
}
export interface IFindingForm
{
  Id: number;
  Affectation_id: number;
  Name: string;
  Description: string;
  Identification_date: Date;
  Impact: string;
  Options: string[];
  Channel: string;
}
export interface IAction{
  Id: number;
  Advance: number;
  Close_date: Date;
  Commitment_date: Date;
  Created: Date;
  Created_by: string;
  Initial_date: Date;
  Observation: string;
  State: number;
  Cause: number;
}
export interface IUser{
  Id: number;
  User: string;
  Name: string;
  Mail: string;
  Profile: string;
  Active: boolean;
}
export interface ITracings{
  Id: number;
  Advance: number;
  Created: Date;
  Observation: string;
  Created_by: string;
  Action_id: number;
  State: number;
}
export interface IActionDetail
{
  Action: IAction;
  Responsables: IUser[];
  Tracings: ITracings[];
  Complements: IFindingAffectation;
}
export interface IDatesPlan
{
  Year: number;
  Months: number[];
}
export interface IPlanDetail{
  Affectation: IAffectationResponse;
  Findings: IFindings[];
}
interface IFindingAffectation{
  Affectation_id: number;
  Finding_id : number;
}