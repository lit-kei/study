
const mapping = fetch('../assets/json/mapping.json');
const blogFile = fetch('../assets/json/blog-data.json');
Promise.all([mapping, blogFile])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([mappingData, blogData]) => {
        const id = window.location.pathname.split('/').pop().replace('.html', '');
        const index = blogData.findIndex(blog => blog.id === id);
        if (index === -1) return;
        const blogBox = document.querySelector('.blog-box');
        if (index != 0) {
            const previous = blogData[index - 1];
            const prevElement = document.createElement('p');
            prevElement.className = 'prev-blog';
            prevElement.innerHTML = `前のブログ<a href="./${previous.id}.html">&#8592; ${previous.title}</a>`;
            blogBox.appendChild(prevElement);
            blogBox.style.display = 'flex';
        } else {
            const dummy = document.createElement('div');
            blogBox.appendChild(dummy);
        }
        if (index != blogData.length - 1) {
            const next = blogData[index + 1];
            const nextElement = document.createElement('p');
            nextElement.className = 'next-blog';
            nextElement.innerHTML = `次のブログ<a href="./${next.id}.html">${next.title} &#8594;</a>`;
            blogBox.appendChild(nextElement);
            blogBox.style.display = 'flex';
        }
        const recommendation = document.querySelector('.recommendation-box');
        if (blogData[index].recommendations && blogData[index].recommendations.length > 0) {
            blogData[index].recommendations.reverse().forEach(recId => {
                const recBlog = blogData.find(blog => blog.id === recId);
                if (recBlog) {
                    document.querySelector('.recommendation').style.display = 'block';
                    const recElement = document.createElement('div');
                    recElement.className = 'blog';
                    recElement.innerHTML = `
                        <div class="content">
                            <h3 class="blog-title">${recBlog.title}</h3>
                            <div class="tags"></div>
                            <p class="summary">${recBlog.summary}</p>
                            <p class="date">
                                <img src="../assets/images/calendar.svg" alt="最終更新日: " class="svg-icon"><span>${recBlog.date}</span>
                                <img src="../assets/images/clock.svg" alt="所要時間: " class="svg-icon" style="margin-left: 15px;"><span>${recBlog.readTime}</span>
                            </p>
                        </div>
                        <picture>
                            <img src="${recBlog.thumbnail}" alt="ブログのサムネイル" class="thumbnail">
                        </picture>
                    `;
                                
                    const tags = recElement.getElementsByClassName('tags')[0];
                    recBlog.tags.forEach(tagData => {
                        const tag = document.createElement('span');
                        tag.className = 'tag';
                        tag.textContent = `# ${tagData}`;
                        tag.addEventListener('click', (e) => {
                            e.stopPropagation();
                            window.location.href = `./search.html?tag=${mappingData[tagData]}`;
                        });
                        tags.appendChild(tag);
                    });
                    recElement.addEventListener('click', () => {
                        window.location.href = recBlog.id + '.html';
                    });
                    recommendation.appendChild(recElement);
                }
            });
        }
        document.querySelectorAll('#top-content .tag').forEach(tag => {
            const text = tag.textContent.slice(2);
            tag.addEventListener('click', () => {
                window.location.href = `./search.html?tag=${mappingData[text]}`;
            });
        });
    }).catch(error => {
        console.error('Error loading blog data:', error);
    });