//External Modules
import { Injectable } from "@angular/core";

@Injectable()
export class FormattingService {

  workOutAccentColour(pos: string) {
    switch (pos) {
      case "GK":
        return "warn";
      case "RWB":
      case "RB":
      case "CB":
      case "LB":
      case "LWB":
        return "danger";
      case "CDM":
      case "RM":
      case "CM":
      case "LM":
      case "RAM":
      case "CAM":
      case "LAM":
        return "success";
      case "RW":
      case "LW":
      case "CF":
      case "ST":
        return "info";
    }

    return "";
  }

  workOutPosId(pos: string) {
    switch (pos) {
      case "GK":
        return 1;
      case "RWB":
        return 2;
      case "RB":
        return 3;
      case "CB":
        return 4;
      case "LB":
        return 5;
      case "LWB":
        return 6;
      case "CDM":
        return 7;
      case "RM":
        return 8;
      case "CM":
        return 9;
      case "LM":
        return 10;
      case "RAM":
        return 11;
      case "CAM":
        return 12;
      case "LAM":
        return 13;
      case "RW":
        return 14;
      case "CF":
        return 15;
      case "ST":
        return 16;
      case "LW":
        return 17;
    }

    return 0;
  }

  findBackgroundColour(style?: string) {
    let bgColour = "#FFFFFF";

    let parts = style !== undefined ? style.split(";") : [];
    parts.forEach(p => {
      if (p.indexOf("background-color") > -1)
        bgColour = p.split(":")[1].trim();
    });

    bgColour = bgColour.replace(";", "");
    if (bgColour == "#FFFFFF") bgColour = "#EEEEEE";

    return bgColour;
  }
}
