//External Modules
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

//Internal Modules
import { TeamDictionaryObj, TeamObj } from "../../app.classes";

@Injectable()
export class TeamsService {

  //Declare variables
  teamDict: TeamDictionaryObj[] = [];
  allTeams: TeamObj[] = [];
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;
  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  getAllTeams() {
    return this.http.get<TeamObj[]>(this.baseUrl + "team", { params: { countryCode: "all" } }).subscribe(result => {
      this.allTeams = [];
      result.forEach(r => {
        r.imgPath = "./assets/logos/" + r.country?.toLowerCase() + "/" + r.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
      });
      result.forEach(r => this.allTeams.push(r));
    }, error => console.error(error));
  }

  getTeamsFromCountry(country: string, countryCode: string, female: boolean) {
    return this.http.get<TeamObj[]>(this.baseUrl + "team", { params: { countryCode: countryCode, female: female } }).subscribe(result => {
      country = country.length > 0 ? country : this.getCountryFromCode(countryCode);
      result.forEach(r => {
        r.imgPath = "./assets/logos/" + country.toLowerCase() + "/" + r.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
      });
      this.teamDict.push({ country: country, countryCode: countryCode, female: female, teams: result });
    }, error => console.error(error));
  }

  getTeamImgFromJustTeamName(teamName: string) {
    let teamFound = this.allTeams.filter(x => x.team == teamName);
    if (teamFound)
      return teamFound[0].imgPath;

    return "";
  }

  getCountryFromCode(countryCode: string) {
    switch (countryCode) {
      case "AR": return "Argentina";
      case "AT": return "Austria";
      case "AU": return "Australia";
      case "BE": return "Belgium";
      case "CH": return "Switzerland";
      case "CN": return "China";
      case "DE": return "Germany";
      case "DK": return "Denmark";
      case "EN": return "England";
      case "ES": return "Spain";
      case "FR": return "France";
      case "IE": return "Republic of Ireland";
      case "IN": return "India";
      case "IT": return "Italy";
      case "KR": return "Republic of Korea";
      case "NL": return "Netherlands";
      case "NO": return "Norway";
      case "PL": return "Poland";
      case "PT": return "Portugal";
      case "RO": return "Romania";
      case "ROW": return "Rest of World"
      case "SA": return "Saudi Arabia";
      case "SC": return "Scotland";
      case "SE": return "Sweden";
      case "TR": return "Turkey";
      case "US": return "USA";
    }

    return "";
  }

  isAmericanTeam(country: string, code: boolean) {
    let countryToSearch = code ? this.getCountryFromCode(country) : country;
    switch (countryToSearch.toLowerCase()) {
      case "argentina":
      case "usa":
        return true;
    }

    return false;
  }

  isEuropeanTeam(country: string, code: boolean) {
    let countryToSearch = code ? this.getCountryFromCode(country) : country;
    switch (countryToSearch.toLowerCase()) {
      case "austria":
      case "belgium":
      case "denmark":
      case "england":
      case "france":
      case "germany":
      case "italy":
      case "netherlands":
      case "norway":
      case "portugal":
      case "republic of ireland":
      case "romania":
      case "scotland":
      case "spain":
      case "sweden":
      case "switzerland":
      case "turkey":
        return true;
    }

    return false;
  }

}
