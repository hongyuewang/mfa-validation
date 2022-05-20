import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'mfa-validation';

  splitNumber(event: any) {
    let data = event.target.value;

    // make sure it's a case of copy/paste
    if (data.length > 1) {
      this.fillNext(event.target, data);
    }
  }

  fillNext(target: any, data: any) {
    // set value as first digit
    target.value = data[0];
    // remove first digit from code
    data = data.substring(1);
    // do the same for every remaining digit
    if (target.nextElementSibling && data.length) {
      this.fillNext(target.nextElementSibling, data);
    }
  }

  constructor() {}

  ngOnInit(): void {
    const input1 = document.getElementById('otc-1') as HTMLElement;
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach((input: any) => {
      input.addEventListener('keyup', (event: any) => {
        // break on shift, tab, cmd, option or control
        if (
          event.keyCode === 16 ||
          event.keyCode === 9 ||
          event.keyCode == 224 ||
          event.keyCode === 18 ||
          event.keyCode === 17
        ) {
          return;
        }

        // on backspace or left arrow, go to the previous input field
        if (
          (event.keyCode === 8 || event.keyCode === 37) &&
          input.previousElementSibling?.tagName === 'INPUT'
        ) {
          input.previousElementSibling.select();
        } else if (event.keyCode !== 8 && input.nextElementSibling) {
          input.nextElementSibling.select();
        }

        // split number if input value is longer than 1
        if (event.target.value.length > 1) {
          this.splitNumber(event);
        }
      });
    });

    // handle copy/paste
    input1.addEventListener('input', (event: any) => {
      this.splitNumber(event);
    });
  }

  ngAfterViewInit(): void {}

  async onClickSubmit(formData: any) {
    let validationCode = "";

    Object.values(formData).forEach((digit: any) => {validationCode += digit});

    const response = fetch(
      'https://cors-anywhere.herokuapp.com/https://coop-interview.outstem.io/validate',
      {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({code: validationCode}),
      }
    );

    const validBoolean = await response.then((value) => value.json()).then((value) => value.valid);

    
  }
}
