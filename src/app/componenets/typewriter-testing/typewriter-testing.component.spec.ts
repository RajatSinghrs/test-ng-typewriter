import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypewriterTestingComponent } from './typewriter-testing.component';

describe('TypewriterTestingComponent', () => {
  let component: TypewriterTestingComponent;
  let fixture: ComponentFixture<TypewriterTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypewriterTestingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypewriterTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
