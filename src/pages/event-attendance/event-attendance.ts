import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventProvider } from '../../providers/event/event';
import { InviteeAttendanceRecordPage } from '../invitee-attendance-record/invitee-attendance-record';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-event-attendance',
  templateUrl: 'event-attendance.html',
})
export class EventAttendancePage implements OnInit {

  event: Event;
  eventDate: Date;
  markedAttendance = true;
  pageName = 'EventAttendancePage';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private eventProvider: EventProvider,
    private actionSheetCtrl: ActionSheetController,
    private barcodeScanner: BarcodeScanner,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider

  ) {
    this.event = this.navParams.get('event');
  }

  ngOnInit() {
    this.eventDate = this.eventProvider.getNextEventDate(this.event);
    this.eventProvider.getAttendanceRecordByEventAndDateAndUser(this.event, this.eventDate, undefined).subscribe(record => {
      if(record){
        this.markedAttendance = true;
      }
      else{
        this.markedAttendance = false;
      }
    })
  }

  onGoToEvent() {
    this.viewCtrl.dismiss();

  }

  recordAttendance() {

    let canMarkAttendance = true;
    //this.event.canMarkAttendance

    let buttons = [
      {
        text: 'Scan QR Code',
        handler: () => {
          this.scanQrCode();
        }
      }
      , {
        text: 'Cancel',
        role: 'cancel',
      }
    ];

    if (canMarkAttendance) {
      let markAttendanceButton = {
        text: 'Mark Attendance',
        handler: () => {
          this.markAttendance();
        }
      };
      buttons.splice(1, 0, markAttendanceButton);
    }
    const actionSheet = this.actionSheetCtrl.create({
      title: "Attendance: " +  this.eventDate.toLocaleDateString(),
      buttons: buttons
    });
    actionSheet.present();

  }

  markAttendance() {
    if(!this.canMarkAttendance()){
      return;
    }
    this.eventProvider.addAttendanceRecord(this.event, this.eventDate, undefined)
    .then(_=> {
      this.mProv.showToastMessage('Attendance successfully recorded!')
    })
    .catch(err => {
      this.mProv.showAlertOkMessage('Error', 'Could not record attendance. Please ty again later.');
      this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not record attendance');
    })

  }

  canMarkAttendance(){
    let earliestDate = this.eventProvider.addMinutes(this.eventDate, -this.event.minutesBeforeAttendance);
    let latestDate = this.eventProvider.addMinutes(this.eventDate, this.event.minutesAfterAttendance);
    let now = new Date();

    if(now < earliestDate){
      this.mProv.showAlertOkMessage('Too early', 'You cannot mark your attendance yet.');
      return false;
    }
    if(now > latestDate){
      this.mProv.showAlertOkMessage('Too late', 'The time to mark your attendance has expired.');
      return false;
    }

    return true;
  }

  openAttendanceRecord(){
    this.navCtrl.push(InviteeAttendanceRecordPage, {'event': this.event});
  }

  private scanQrCode() {
    var loader = this.mProv.getLoader('Loading...');
    loader.present();
    this.barcodeScanner.scan({ disableSuccessBeep: true })
            .then(barcodeData => {
              loader.dismiss();
              if(!barcodeData.cancelled){
                //var eventLoader = this.mProv.getLoader('Getting event information...');
                //eventLoader.present();
                if(this.event.id != barcodeData.text){
                  this.mProv.showAlertOkMessage('Error', 'This QR code does not belong to this event.');
                }
                else{
                  this.markAttendance();
                }
              }
            })
            .catch(err => {
              loader.dismiss();
              this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not scan qr code');
              if(err == 'Access to the camera has been prohibited; please enable it in the Settings app to continue.'){
                this.mProv.showAlertOkMessage('Error', err);
                //todo open only if user wants to change settings
                //this.qrScanner.openSettings();
              }
              this.mProv.showAlertOkMessage('Error', 'Could not scan QR Code');
            });
      loader.dismiss();        

  }

}
