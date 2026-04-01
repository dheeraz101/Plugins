let currentApi = null;

export const meta = {
  id: 'random-quote',
  name: 'Random Quotes',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" }
  ];

  api.injectCSS(meta.id, `
    .rq-widget { width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; padding: 24px; box-sizing: border-box; text-align: center; }
    .rq-quote { font-size: 16px; color: #e0e0e0; line-height: 1.6; font-style: italic; margin-bottom: 16px; }
    .rq-author { font-size: 13px; color: #7c6fff; font-weight: 600; margin-bottom: 20px; }
    .rq-btn { padding: 8px 20px; background: rgba(124,111,255,0.2); color: #7c6fff; border: 1px solid rgba(124,111,255,0.3); border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .rq-btn:hover { background: rgba(124,111,255,0.3); }
  `);

  const container = api.container;
  let current = quotes[Math.floor(Math.random() * quotes.length)];

  function render() {
    container.innerHTML = `
      <div class="rq-widget">
        <div class="rq-quote">"${current.text}"</div>
        <div class="rq-author">— ${current.author}</div>
        <button class="rq-btn" id="rq-new">✨ New Quote</button>
      </div>
    `;
    container.querySelector('#rq-new').addEventListener('click', () => {
      current = quotes[Math.floor(Math.random() * quotes.length)];
      render();
    });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
