//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

//Internal Modules
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { ChartsService } from '../../shared/services/charts.service';
import { MoneyLogObj, TransferLogObj } from '../../app.classes';

@Component({
  selector: 'career-mode-transfers',
  templateUrl: './career-mode-transfers.template.html',
  styleUrls: ['../../../styles.css', './career-mode-transfers.styles.css'],
  standalone: true,
  imports: [AvatarModule, ChartModule, CommonModule, ProgressSpinnerModule, TableModule, TabsModule, TagModule]
})

export class CareerModeTransfersComponent {

  //Declare array variables
  transferLog: TransferLogObj[] = [];
  moneyLog: MoneyLogObj[] = [];

  //Declare chart variables
  moneyLogChartData: any;
  moneyLogChartOptions: any;

  //Declare other variables
  careerId!: number;
  currency: string = "£";
  loading: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private charts: ChartsService, private http: HttpClient,
    private router: Router, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    let cmid = this.cmTrackerService.getCareerModeId();
    if (cmid == undefined || cmid == 0)
      this.router.navigate(["/"]);

    this.careerId = cmid;
    this.populateTransferLog();
  }

  populateTransferLog() {
    this.loading = true;

    this.http.get<TransferLogObj[]>(this.baseUrl + "transferlog", { params: { careerId: this.careerId } }).subscribe(result => {
      this.transferLog = result;
      this.transferLog.forEach(t => {
        t.statusSeverity = t.status == "In" ? "success" : "danger";
      });
      this.populateMoneyLog();
    });

  }

  populateMoneyLog() {
    this.moneyLog = [];
    for (var i = 1; i <= 15; i++)
      this.moneyLog.push({ id: i, year: i, spent: 0, spentDisplay: "", received: 0, receivedDisplay: "" });

    this.transferLog.forEach(t => {
      if (t.fee > 0) {
        if (t.status == "In") this.moneyLog.filter(x => x.year == t.year)[0].spent += t.fee;
        else this.moneyLog.filter(x => x.year == t.year)[0].received += t.fee;
      }
    });

    this.moneyLog.forEach(m => {
      m.spentDisplay = m.spent.toLocaleString("en-US");
      m.receivedDisplay = m.received.toLocaleString("en-US");
      m.profit = m.received - m.spent;
      m.profitDisplay = m.profit.toLocaleString("en-US");
    });
    this.constructMoneyLogChart();

    this.loading = false;
  }

  constructMoneyLogChart() {
    let labels = this.moneyLog.map(x => { return "Year " + x.year; });
    let yData = [{ label: 'Money Spent', bgColor: '#000000', data: this.moneyLog.map(x => { return x.spent; }) },
      { label: 'Money Received', bgColor: '#FF0000', data: this.moneyLog.map(x => { return x.received; }) }];

    let maxSpent = this.moneyLog.map(x => { return x.spent; }).sort((a, b) => b - a)[0];
    let maxReceived = this.moneyLog.map(x => { return x.received; }).sort((a, b) => b - a)[0];

    this.moneyLogChartData = this.charts.buildBarChart(labels, [], yData);
    this.moneyLogChartOptions = this.charts.getBarChartOptions(maxSpent > maxReceived ? maxSpent : maxReceived);
  }

}
