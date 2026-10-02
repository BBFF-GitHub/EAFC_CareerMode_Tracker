//External Modules
import { Injectable } from "@angular/core";

//Internal Modules
import { CurrentSeasonFixtureObj, CurrentSeasonSquadPlayerObj, EndOfSeasonLeagueTableRowObj, InternationalsPlayerObj, LeagueObj, PlayerPicObj } from "../../app.classes";

@Injectable()
export class UtilitiesService {

  //Declare variables
  allLeagues: string[] = ["LFP", "A-League", "Austrian Bundesliga", "1A Pro League", "CSL", "3F Superliga", "Premier League",
    "EFL Championship", "EFL League One", "EFL League Two", "Ligue 1", "Ligue 2", "Bundesliga", "2. Bundesliga", "3. Liga",
    "Hero ISL", "Serie A", "Serie B", "Eredivisie", "Eliteserien", "Ekstraklasa", "Liga Portugal", "SSE Airtricity Premier Division",
    "K League 1", "Liga I", "RSL", "SPFL", "La Liga", "La Liga 2", "Allsvenskan", "Swiss Super League", "Süper Lig", "MLS"];

  //Every position code used across any formation view - the full set a player could be eligible for,
  //independent of whichever formation happens to be selected right now.
  allPositions: string[] = ["GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "RM", "LM", "RAM", "LAM", "RW", "LW", "ST"];

  checkIsDraggableLeagueOrder(league: string) {
    switch (league) {
      case "1A Pro League":
      case "SPFL":
        return true;
      default:
        return false;
    }
  }

  checkIsKnockoutGame(fixture: CurrentSeasonFixtureObj, fixtureList: CurrentSeasonFixtureObj[]) {
    switch (fixture.competition) {
      case "Österreich-Pokal":
      case "Croky Cup":
      case "Sydbank Pokalen":
      case "FA Cup":
      case "Papa John's Trophy":
      case "Coupe Nationale":
      case "DFB-Pokal":
      case "Oranje Beker":
      case "NM":
      case "Puchar Kraju":
      case "EA Sports Cup":
      case "Cupa Naţională":
      case "Scottish Cup":
      case "Schweizer Pokal":
      case "US Open Cup":
      case "Community Shield":
      case "Supercup":
      case "Trophée des Champions":
        return true;
      case "Carabao Cup":
        let emptyCount = fixtureList.filter(x => x.result?.length == 0).length;
        if (emptyCount >= 3) return true;
        else if (emptyCount == 0) return true;
        else return false;
      case "Coppa Italia":
        //LOGIC
        debugger;
        return true;
      case "Taça Portuguesa":
        //LOGIC
        debugger;
        return true;
      case "Copa de España":
        //LOGIC
        debugger;
        return true;
      case "Sveriges Cup":
        //LOGIC
        debugger;
        return true;
      case "Türk Kupasi":
        //LOGIC
        debugger;
        return true;
      default:
        return false;
    }
  }

  checkIsLeagueGame(fixture: CurrentSeasonFixtureObj) {
    return this.allLeagues.indexOf(fixture.competition) > -1;
  }

  checkIsPromoted(league: string, pos: number) {
    switch (league) {
      case "EFL Championship":
      case "EFL League One":
        return pos <= 2;
      case "EFL League Two":
        return pos <= 3;
    }

    return false;
  }

  filterSquad(squad: CurrentSeasonSquadPlayerObj[], pos: string, includeYouth: boolean = false) {
    let isEligible = (x: CurrentSeasonSquadPlayerObj) => x.position == pos || (x.eligiblePositions != undefined && x.eligiblePositions.includes(pos));

    if (includeYouth) {
      let toRtn = squad.filter(x => isEligible(x) && !x.loanedOut && !x.transferListed && !x.loanListed && !x.preContract && !x.preContractOut && !x.remove);
      toRtn.forEach(tr => { if (tr.youthSquad) tr.order = 100; });
      return toRtn;
    }
    else
      return squad.filter(x => isEligible(x) && !x.loanedOut && !x.transferListed && !x.loanListed && !x.youthSquad && !x.preContract && !x.preContractOut && !x.remove);
  }

  getSuffix(num: number) {
    switch (num % 100) {
      case 11:
      case 12:
      case 13:
        return num + "th";
    }

    switch (num % 10) {
      case 1:
        return num + "st";
      case 2:
        return num + "nd";
      case 3:
        return num + "rd";
      default:
        return num + "th";
    }
  }

  getTransferDateYear(year: number) {
    let yr = 2024;
    return yr + year;
  }

  sortLeagueOrder(table: EndOfSeasonLeagueTableRowObj[]) {
    return table.sort((a, b) => a.points != b.points ? b.points - a.points : a.goalDifference != b.goalDifference ? b.goalDifference - a.goalDifference : b.goalsScored - a.goalsScored);
  }

  sortSquadByOrder(squad: CurrentSeasonSquadPlayerObj[]) {
    return squad.sort((a, b) => a.order == undefined || b.order == undefined ? 0 : a.order - b.order);
  }

  sortSquadByPosThenCaps(squad: CurrentSeasonSquadPlayerObj[]) {
    return squad.sort((a, b) => a.posId == undefined || b.posId == undefined || a.posId == 0 || b.posId == 0 ? 100 :
      a.posId - b.posId != 0 ? a.posId - b.posId : b.caps - a.caps);
  }

  sortSquadImgsByPos(squad: PlayerPicObj[]) {
    return squad.sort((a, b) => a.posId == undefined || b.posId == undefined || a.posId == 0 || b.posId == 0 ? 100 :
      a.posId - b.posId != 0 ? a.posId - b.posId : 0);
  }

  sortSquadByRating(squad: CurrentSeasonSquadPlayerObj[]) {
    return squad.sort((a, b) => a.ratingDisplay == undefined || b.ratingDisplay == undefined ? 0 : b.ratingDisplay - a.ratingDisplay);
  }

  sortSquadByTopScorer(squad: CurrentSeasonSquadPlayerObj[]) {
    return squad.sort((a, b) => b.goals - a.goals).filter(x => x.goals > 0);
  }

  sortInternationalSquadByPosThenCaps(squad: InternationalsPlayerObj[]) {
    return squad.sort((a, b) => a.posId == undefined || b.posId == undefined || a.posId == 0 || b.posId == 0 ? 100 :
      a.posId - b.posId != 0 ? a.posId - b.posId : b.caps - a.caps);
  }

  sortInternationalSquadByTopScorer(squad: InternationalsPlayerObj[]) {
    return squad.sort((a, b) => b.goals - a.goals).filter(x => x.goals > 0);
  }
}
