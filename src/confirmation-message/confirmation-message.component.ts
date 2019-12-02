import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-confirmation-message',
  templateUrl: './confirmation-message.component.html',
  styleUrls: ['./confirmation-message.component.scss']
})
export class ConfirmationMessageComponent implements OnInit {
  @Input() title: string = "";
  @Input() MiddleMessage: string = "";
  @Input() Options: any = null;
  @Input() Buttons: any[] = [];
  @Input() FooterButtons: any[] = [];
  LeftEmpty: any[] = [];
  RightEmpty: any[] = [];
  constructor(public activeModal: NgbActiveModal) { }
  SelectAction(IsFooter,text) {
    this.activeModal.close({ "IsFooter": IsFooter, "Text": text });
  }
  ngOnInit() {
    if (this.Options == null) {
      this.Options={};
      this.Options.leftCss = "";
      this.Options.css = "";
      this.Options.rightCss = "";
      this.Options.footerCSS = "";

    }
    if (this.Options != null) {


      if (this.Options.LeftEmptyCount != undefined && this.Options.LeftEmptyCount != null) {
        for (var i = 0; i < this.Options.LeftEmptyCount; i++) {
          this.LeftEmpty.push(new Object());
        }

      }
      this.RightEmpty = [];

      if (this.Options.RightEmptyCount != undefined && this.Options.RightEmptyCount != null) {
        for (var i = 0; i < this.Options.RightEmptyCount; i++) {
          this.RightEmpty.push(new Object());
        }
      }
    }
  }

}
