import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindFolioUserComponent } from './find-folio-user.component';

describe('FindFolioUserComponent', () => {
  let component: FindFolioUserComponent;
  let fixture: ComponentFixture<FindFolioUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindFolioUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindFolioUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
