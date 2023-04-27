/**作者
 * @author 薛定谔的大灰机
 * @name 网盘资源
 * @origin 大灰机   抄自(onz3v)
 * @version 1.0.1
 * @description 网盘资源搜索
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(wp|网盘)(.*)$
 * @priority 1
 * @admin false
 * @disable false
 */

const cheerio = require('cheerio');
const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件

module.exports = async s => {
    s.delMsg(s.getMsgId())
    let data = await mo.request({
        'url': 'https://www.pansearch.me/search',
        params: {
            'keyword': s.param(2),
            'pan': 'aliyundrive'
        }
    })
    if (data.status == 200) {
        if ((list = await content(data.data)).length > 1) {
            if (num = (await mo.again(s, `共${list.length}条请选择：`)) || (num == 0)) {
                if (['a', 'all', 'ALL'].includes(num)) {
                    for (let i = 0; i < list.length; i++) {
                        if (s.getFrom() == `wxXyo`) list[i].image = ``
                        mo.reply(s, {
                            type: 'image',
                            msg: `${list[i].title}\n${list[i].updateTime}`,
                            path: {
                                path: list[i].image || ``,
                                suffix: 'jpg'
                            },
                            dontEdit: true
                        })
                    }
                } else {
                    num = num - 1
                    mo.reply(s, {
                        type: 'image',
                        msg: `${list[num].title}\n${list[num].updateTime}`,
                        path: {
                            path: list[num].image || ``,
                            suffix: 'jpg'
                        },
                        dontEdit: true
                    })
                }
            } else {
                console.log(`num`);
                return
            }
        } else {
            console.log(`length`);
        }
    } else {
        console.log(`error`);
    }
}

async function content(html) {
    const $ = cheerio.load(html);
    let list = $('.grid .items-start').map((_, item) => {
        const resourceInfo = $(item).find('.whitespace-pre-wrap');
        const resourceText = resourceInfo.text().replace(/🏷 标签[\s\S]*?投稿.*/g, "");;
        const updateTime = $(item).find('p').text();
        const image = $(item).find('img').attr('src');
        const url = $(item).find('.resource-link').attr('href');
        return {
            title: resourceText,
            updateTime,
            image,
            url
        }
    }).get();
    return list
}