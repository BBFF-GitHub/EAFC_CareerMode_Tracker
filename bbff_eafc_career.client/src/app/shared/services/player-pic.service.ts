//External Modules
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

//Internal Modules
import { FormattingService } from "./formatting.service";
import { OfficialPlayerDataObj, PlayerPicObj } from "../../app.classes";

@Injectable()
export class PlayerPicService {

  baseUrl: string;

  constructor(private formatService: FormattingService, private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getPotentialImages(playerName: string) {
    let toRtn: PlayerPicObj[] = [];

    this.http.get<OfficialPlayerDataObj[]>(this.baseUrl + "officialplayerdata/byname", { params: { name: playerName } }).subscribe(result => {
      this.mapToPlayerPics(result).forEach(p => toRtn.push(p));
    }, error => console.error(error));

    return toRtn;
  }

  getPrePopulatedSquad(countryCode: string, teamName: string, gender: string) {
    let toRtn: PlayerPicObj[] = [];
    let ogClubName = this.mapOgClubTeamName(teamName, countryCode);

    this.http.get<OfficialPlayerDataObj[]>(this.baseUrl + "officialplayerdata/byclub", { params: { ogClub: ogClubName, gender: gender } }).subscribe(result => {
      this.mapToPlayerPics(result).forEach(p => toRtn.push(p));
    }, error => console.error(error));

    return toRtn;
  }

  mapToPlayerPics(data: OfficialPlayerDataObj[]): PlayerPicObj[] {
    return data.map(row => {
      return {
        name: row.name, photo: row.photoUrl, photoBig: row.photoUrl, nationality: row.nationality, flag: row.flagUrl,
        position: row.position, ogClub: row.ogClub, gender: row.gender, posId: this.formatService.workOutPosId(row.position)
      };
    });
  }

  mapOgClubTeamName(teamName: string, countryCode: string) {
    switch (countryCode) {
      case "EN":
        return this.mapOgClubsEngland(teamName);
      default:
        return teamName;
    }
  }

  mapOgClubsEngland(teamName: string) {
    switch (teamName.toLowerCase()) {
      case "accrington stanley":
      case "bolton wanderers":
      case "brighton & hove albion":
      case "colchester united":
      case "doncaster rovers":
      case "huddersfield town":
      case "ipswich town":
      case "northampton town":
      case "norwich city":
      case "peterborough united":
      case "preston north end":
      case "shrewsbury town":
      case "stockport county":
      case "wycombe wanderers":
        return teamName.split(' ')[0];
      case "bournemouth":
        return "AFC Bournemouth"
      case "bromley":
        return "Bromley FC";
      case "cambridge united":
      case "newcastle united":
      case "rotherham united":
      case "sheffield united":
        return teamName.replace("United", "Utd");
      case "charlton athletic":
        return "Charlton Ath";
      case "manchester united":
        return "Man Utd";
      case "nottingham forest":
        return "Nott M Forest";
      case "queens park rangers":
        return "QPR";
      case "sheffield wednesday":
        return "Sheffield Wed";
      case "tottenham hotspur":
        return "Spurs";
      case "west bromwich albion":
        return "West Brom";
      case "west ham united":
        return "West Ham";
      case "wolverhampton wolves":
        return "Wolves";
      default:
        return teamName;
    }
  }
}
