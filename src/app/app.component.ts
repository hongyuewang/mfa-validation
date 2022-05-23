import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'mfa-validation';
  isSubmissionValid: boolean = false;
  validBoolean: boolean | undefined = undefined;
  validHeader: string = '';

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

  @ViewChild('askApprovalModal')
  askApprovalElementRef!: ElementRef;
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    const input1 = document.getElementById('otc-1') as HTMLInputElement;
    const input2 = document.getElementById('otc-2') as HTMLInputElement;
    const input3 = document.getElementById('otc-3') as HTMLInputElement;
    const input4 = document.getElementById('otc-4') as HTMLInputElement;
    const input5 = document.getElementById('otc-5') as HTMLInputElement;
    const input6 = document.getElementById('otc-6') as HTMLInputElement;
    const inputs = document.querySelectorAll('input[type="number"]');
    const form = document.getElementById('otc') as HTMLElement;
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

    form.addEventListener('keyup', (event: any) => {
      if (
        input1.value.length === 1 &&
        input2.value.length === 1 &&
        input3.value.length === 1 &&
        input4.value.length === 1 &&
        input5.value.length === 1 &&
        input6.value.length === 1
      ) {
        this.isSubmissionValid = true;
      } else {
        this.isSubmissionValid = false;
      }
    });
  }

  ngAfterViewInit(): void {}

  async onClickSubmit(form: any) {
    let validationCode = '';

    Object.values(form.value).forEach((digit: any) => {
      validationCode += digit;
    });

    const response = fetch(
      'https://wang-cors-anywhere.herokuapp.com/https://coop-interview.outstem.io/validate',
      {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: validationCode.slice(0,6) }),
      }
    );

    this.validBoolean = await response
      .then((response) => {
        if (response.ok) {
          return response;
        } else {
          throw new Error('Something went wrong.');
        }
      })
      .then((value) => value.json())
      .then((value) => {
        this.validHeader = value.valid
          ? 'Your code is valid.'
          : 'Your code is invalid.';
        return value.valid;
      })
      .catch(async (error) => {
        this.validHeader =
          'Error ' +
          (await response.then((response) => String(response.status)));
        console.log('Request failed', error);
      });

    this.open(this.askApprovalElementRef);
    form.resetForm();
    this.isSubmissionValid = false;
  }

  open(content: any) {
    this.modalService.open(content);
  }

  validationMessage(bool: boolean | undefined): string {
    if (bool === true) {
      return 'You have been successfully authenticated.';
    } else if (bool === false) {
      return 'Please try again.';
    } else {
      return 'Something went wrong. Please try again later.';
    }
  }
}
