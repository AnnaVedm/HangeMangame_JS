import './style.scss';
import mock from '../src/mock/index';
import { toast } from './utils/toast.ts';

interface IWord {
  word: string;
  hint: string;
}

class Hangman {
  private word: HTMLDivElement;
  private hint: HTMLDivElement;
  private wrongLettersEl: HTMLDivElement;
  private figureParts: NodeListOf<HTMLElement>;
  private btnPlay: HTMLButtonElement;
  private selectedWord: IWord = mock[Math.floor(Math.random() * mock.length)];
  private correctLetters: string[] = [];
  private wrongLetters: string[] = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.createDOM();
    this.setupEventListeners();
  }

  private createDOM(): void {
    const root = document.querySelector('#app') as HTMLDivElement;
    if (!root) return;

    root.innerHTML = `
      <div class='grid items-start gap-4 game p-6 border-4 border-pink-300 rounded-2xl bg-white shadow-xl max-w-4xl mx-auto'>
        <h1 class='font-bold text-4xl md:text-5xl text-center text-pink-600 mb-2'>Виселица</h1>
        <p class='text-md md:text-lg text-center text-gray-700'>Угадайте скрытое слово — Введите букву на клавиатуре</p>

        <div class='bg-pink-50 border border-pink-200 p-4 rounded-lg text-gray-800 text-sm md:text-base'>
          <h2 class='font-semibold text-pink-700 mb-2'>🎮 Правила игры:</h2>
          <ul class='list-disc pl-6 space-y-1'>
            <li>Игра случайным образом выбирает слово и показывает к нему подсказку.</li>
            <li>Вы должны угадать это слово, вводя буквы с клавиатуры.</li>
            <li>Каждая неправильная буква рисует часть виселицы.</li>
            <li>Если вы угадаете слово до полной фигуры — вы победили!</li>
            <li>Если фигура полностью нарисована — вы проиграли.</li>
          </ul>
        </div>

        <div class='content bg-white max-w-lg mx-auto border-2 border-gray-200 rounded-lg p-6 shadow-md'>
          <div data-hint class='text-center mb-4 text-gray-600'></div>

          <svg height='350' width='300' class='figure mx-auto'>
            <line x1='80' y1='40' x2='220' y2='40' stroke='#333' stroke-width='4' />
            <line x1='220' y1='40' x2='220' y2='80' stroke='#333' stroke-width='4' />
            <line x1='80' y1='40' x2='80' y2='320' stroke='#333' stroke-width='4' />
            <line x1='40' y1='320' x2='120' y2='320' stroke='#333' stroke-width='4' />

            <circle cx='220' cy='110' r='30' class='figure__part' stroke='#dc2626' stroke-width='3' fill='none' />
            <line x1='220' y1='140' x2='220' y2='230' class='figure__part' stroke='#dc2626' stroke-width='3' />
            <line x1='220' y1='160' x2='190' y2='130' class='figure__part' stroke='#dc2626' stroke-width='3' />
            <line x1='220' y1='160' x2='250' y2='130' class='figure__part' stroke='#dc2626' stroke-width='3' />
            <line x1='220' y1='230' x2='190' y2='280' class='figure__part' stroke='#dc2626' stroke-width='3' />
            <line x1='220' y1='230' x2='250' y2='280' class='figure__part' stroke='#dc2626' stroke-width='3' />

            <g class='figure__face hidden'>
              <line x1='210' y1='100' x2='215' y2='105' stroke='#dc2626' stroke-width='2' />
              <line x1='215' y1='100' x2='210' y2='105' stroke='#dc2626' stroke-width='2' />
              <line x1='230' y1='100' x2='225' y2='105' stroke='#dc2626' stroke-width='2' />
              <line x1='225' y1='100' x2='230' y2='105' stroke='#dc2626' stroke-width='2' />
              <path d='M210 120 Q220 130 230 120' stroke='#dc2626' stroke-width='2' fill='none' />
            </g>
          </svg>

          <div class='wrong-letters mt-6 text-center'>
            <p class='text-lg font-medium text-red-600 hidden'>Неправильные буквы:</p>
            <div data-wrong-letters class='flex gap-2 justify-center mt-2 flex-wrap'></div>
          </div>

          <div class='word mt-8 mb-6 flex justify-center gap-3 flex-wrap' data-word></div>

          <button data-play class='hidden mx-auto px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors'>
            Играть снова
          </button>
        </div>
      </div>
    `;

    this.word = root.querySelector('[data-word]')!;
    this.hint = root.querySelector('[data-hint]')!;
    this.wrongLettersEl = root.querySelector('[data-wrong-letters]')!;
    this.figureParts = root.querySelectorAll('.figure__part')!;
    this.btnPlay = root.querySelector('[data-play]')!;
  }

  private setupEventListeners(): void {
    this.displayWord();
    window.addEventListener('keydown', this.handleKeyDown);
    this.btnPlay.addEventListener('click', () => location.reload());
  }

  private displayWord = (): void => {
    console.log(`Подсказка: ${this.selectedWord.word}`);

    this.hint.innerHTML = `<h3 class='font-bold'>📌 Подсказка:</h3> ${this.selectedWord.hint}`;
    this.word.innerHTML = `${this.selectedWord.word
      .split('')
      .map(letter => `<span class='bg-gray-100'>${this.correctLetters.includes(letter) ? letter : ''}</span>`)
      .join('')}`;

    if (this.word.innerText.replace(/\n/g, '').toLowerCase() === this.selectedWord.word.toLowerCase()) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.btnPlay.classList.remove('hidden');
      document.querySelector('.wrong-letters')!.style.display = 'none';
      document.querySelector('.figure')!.style.display = 'none';
      toast('Поздравляем! Вы выиграли!', 'success');
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const { keyCode, key } = event;
    const letter = key.toLowerCase();

    if (keyCode >= 65 && keyCode <= 90) {
      if (this.selectedWord.word.includes(letter)) {
        if (!this.correctLetters.includes(letter)) {
          this.correctLetters.push(letter);
          this.displayWord();
        } else {
          toast('Вы уже вводили эту букву', 'warning');
        }
      } else {
        if (!this.wrongLetters.includes(letter)) {
          this.wrongLetters.push(letter);
          this.updateLetters();
        } else {
          toast('Вы уже вводили эту букву', 'warning');
        }
      }
    }
  };

  private updateLetters(): void {
    if (this.wrongLetters.length > 0) {
      document.querySelector('.wrong-letters p')!.classList.remove('hidden');
    }
    this.wrongLettersEl.innerHTML = `${this.wrongLetters.map(letter => `<span class='h5'>${letter}</span>`).join('')}`;
    this.figureParts.forEach((part, index) => {
      part.style.display = index < this.wrongLetters.length ? 'block' : 'none';
    });
    if (this.wrongLetters.length === this.figureParts.length) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.btnPlay.classList.remove('hidden');
      document.querySelector('.wrong-letters')!.style.display = 'none';
      document.querySelector('.figure')!.style.display = 'none';
      toast('К сожалению, вы проиграли.', 'error');
    }
  }
}

new Hangman();
