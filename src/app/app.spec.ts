/**
 *
 *
 * Unit tests for the root component of the application (AppComponent)
 *
 * Test file (spec) to validate the correct functionality
 * of the main component `AppComponent` using the Angular testing
 * framework (Jasmine + Karma).
 *
 * @file app.spec.ts
 * @test AppComponent
 *
 *
 */
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {

  /**
 *
 *
 * Initial configuration before each test.
 * Sets up the test module with the component to be tested.
 *
 *
 */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  /**
 *
 *
 * Verifies that the component is created correctly.
 *
 *
 */
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  /**
 *
 *
 * Verifies that the application title is rendered correctly
 * in the template.
 *
 *
 */
  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, autoservice-front');
  });
});
