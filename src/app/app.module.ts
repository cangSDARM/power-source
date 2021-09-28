import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgHelperService } from 'src/services/ngcomps.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PreludeComponent } from './prelude/prelude.component';

@NgModule({
  declarations: [AppComponent, PreludeComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [NgHelperService],
  bootstrap: [AppComponent],
})
export class AppModule {}
