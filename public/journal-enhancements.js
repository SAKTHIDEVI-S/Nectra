const search = document.querySelector('#journalSearch');
const category = document.querySelector('#journalCategory');
function filterNotes() {
 const query = (search?.value || '').trim().toLowerCase();
 let count = 0;
 document.querySelectorAll('.journal-card').forEach(card => {
  const matches = card.textContent.toLowerCase().includes(query) && (!category?.value || card.dataset.category === category.value);
  card.hidden = !matches;
  if (matches) count++;
 });
 document.querySelector('#journalResults').textContent = count ? `${count} guides to explore` : 'No matching guide yet. Try “honey”, “store” or clear the filters.';
 const url = new URL(location.href);
 for (const [key,value] of [['q',query],['category',category?.value]]) value ? url.searchParams.set(key,value) : url.searchParams.delete(key);
 history.replaceState(null,'',url);
}
if (search) {
 const params = new URLSearchParams(location.search);
 search.value = params.get('q') || '';
 category.value = params.get('category') || '';
 search.addEventListener('input',filterNotes);
 category.addEventListener('change',filterNotes);
 filterNotes();
}
