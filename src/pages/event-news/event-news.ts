import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, ModalController } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventDetailPage } from '../event-detail/event-detail';
import { EventAttendancePage } from '../event-attendance/event-attendance';
import { EventPollsPage } from '../event-polls/event-polls';
import { EventBlogPage } from '../event-blog/event-blog';
import { UserProvider } from '../../providers/user/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { EventProvider } from '../../providers/event/event';
import { EventInviteesPage } from '../event-invitees/event-invitees';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseApp } from 'angularfire2';
import { EventAttendanceAdminPage } from '../event-attendance-admin/event-attendance-admin';
import { EventQrcodePage } from '../event-qrcode/event-qrcode';
import { MessagingProvider } from '../../providers/messaging/messaging';

@IonicPage()
@Component({
  selector: 'page-event-news',
  templateUrl: 'event-news.html',
})
export class EventNewsPage implements OnInit {

  event: Event;
  eventAttendancePage = EventAttendancePage;
  eventInviteesPage = EventInviteesPage;
  eventBlogPage = EventBlogPage;
  eventPollsPage = EventPollsPage;
  isManaging: boolean = false;
  imageURL: string;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    private modalCtrl: ModalController,
    private eventProvider: EventProvider  ) {
  }

  ngOnInit(): void {
    let eventId = this.navParams.get('eventId');
    this.eventProvider.getEvent(eventId).subscribe(event => {
      if(event == null || event.name == null){
        this.navCtrl.popToRoot();
        return;
      }
      this.event = event;
      console.log(event);
      this.isManaging = this.eventProvider.isEventAdmin(this.event, undefined, undefined);
    })

  }

  onOpenInfo() {
    this.navCtrl.push(EventDetailPage, { event: this.event, 'isManaging': this.isManaging });
  }

  openAttendance() {
    if (this.isManaging) {
      this.navCtrl.push(EventAttendanceAdminPage,{ 'event': this.event });
    }
    else {
      this.navCtrl.push(EventAttendancePage, { 'event': this.event });
    }
  }

  openQrpage() {
    let modal = this.modalCtrl.create(EventQrcodePage, { 'event': this.event });
    modal.present();
  }
}