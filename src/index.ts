import * as fs from 'fs'
import path = require('path')

if (fs.existsSync(path.join(__dirname, '../', 'dist'))) {
    fs.rmSync(path.join(__dirname, '../', 'dist'), {
        recursive: true,
        force: true
    })
}
interface DirObject {
    total: number,
    done: number,
    path: string,
    segment: string
    content?: { [fileName: string]: DirObject },
    type: 'dir'|'file'
    index: number|null
}
const readdir = (_path: string, _contentsPath: DirObject[] = []): DirObject => {
    const contents: DirObject = {
        total: 0,
        done: 0,
        path: _path,
        segment: _path.split(path.sep).pop() || '',
        content: {} as any,
        type: 'dir',
        index: null
    }
    if (/^[0-9]+(\-)?/g.test(contents.segment)) {
        contents.index = Number(contents.segment.replace(/(?<=^[0-9]+).*$/g, ''))
    }
    const dirContents = fs.readdirSync(_path, { encoding: 'utf-8', recursive: true, withFileTypes: true })
    for (const content of dirContents) {
        if (content.isDirectory()) {
            (contents.content as any)[content.name] = readdir(path.join(_path, content.name), [..._contentsPath, contents])
        }
        else if (content.isFile() && /^(readme|index)\.md$/.test(content.name)) {
            const file = fs.readFileSync(`${path.join(_path, content.name)}`).toString('utf8').split(/\r\n|\r|\n/).map((v) => {
                const exec = /^\s*\[((\s*)|([0-9]+)|x)\]\s*/g.exec(v)
                const execDone = /^\s*\[x\]\s*/g.exec(v)
                if (exec) {
                    if (execDone) {
                        return 2
                    }
                    return 1
                }
                return 0
            })
            if (file.length) {
                (contents.content as any)[content.name] = {
                    total: file.filter((v) => v > 0).length,
                    done: file.filter((v) => v === 2).length,
                    path: path.join(_path, content.name),
                    segment: path.join(_path, content.name).split(path.sep).pop(),
                    type: 'file'
                }
                contents.total += (contents.content as any)[content.name].total
                contents.done += (contents.content as any)[content.name].done
                for (let i = _contentsPath.length - 1; i >= 0; i --) {
                    _contentsPath[i].total += (contents.content as any)[content.name].total
                    _contentsPath[i].done += (contents.content as any)[content.name].done
                }
            }
        }
    }
    return contents
}
const buildDocs = (dir: DirObject, dirs: DirObject[] = []) => {
    const basePath = __dirname.replace(/(\\|\/)+src(\\|\/)*$/g, '').replace(/\\|\//g, path.sep)
    const baseDistPath = path.join(basePath, 'dist')
    const baseDocsPath = path.join(basePath, 'docs')
    const distPath = path.join(baseDistPath, dir.path.replace(baseDistPath, '').replace(baseDocsPath, ''))
    const docsPath = path.join(baseDocsPath, dir.path.replace(baseDistPath, '').replace(baseDocsPath, ''))
    const generateUpperCamelCaseKey = (dir: DirObject) => {
        const distPath = path.join(baseDistPath, dir.path.replace(baseDistPath, '').replace(baseDocsPath, ''))
        const docsPath = path.join(baseDocsPath, dir.path.replace(baseDistPath, '').replace(baseDocsPath, ''))
        let upperCamelCaseKey = ''
        let splits = []
        if (baseDistPath !== distPath) {
            splits = distPath.split(/\\|\//g).pop()?.replace(/^(\\|\/)*[0-9]+\-/, '').split(/\-/g) || []
            for (const split of splits) {
                upperCamelCaseKey += `${split.substring(0, 1).toUpperCase()}${split.substring(1)} `
            }
            upperCamelCaseKey = upperCamelCaseKey.trim()
        }
        return upperCamelCaseKey
    }
    const processFile = (file: string, descriptionOnly: boolean) => {
        let status: 'todo'|'done'|'none' = 'none'
        interface Node {
            type: 'todo'|'done'|'none'
            name: null|string
            value: string
            index: number|null
        }
        let node: Node = {
            type: 'none',
            name: null,
            value: '',
            index: 0
        }
        const nodes: Node[] = [node]
        for (const line of file.split(/\r\n|\r|\n/)) {
            if (/^\s*\[(\s*)|([0-9]+)\]\s*/.test(line)) {
                status = 'todo'
                node = {
                    type: status,
                    name: line.replace(/^\s*\[(\s*)|([0-9]+)\]\s*/g, ''),
                    value: `\n_____\n## ❌ ${line.replace(/^\s*\[(\s*)|([0-9]+)\]\s*/g, '')}`,
                    index: /^\s*\[[0-9]+\]/.test(line)
                        ? Number(line.replace(/^\s*\[/g, '').replace(/\].*$/g, '')) - 1
                        : null
                }
                nodes.push(node)
            }
            else if (/^\s*\[x\]\s*/.test(line)) {
                status = 'done'
                node = {
                    type: status,
                    name: line.replace(/^\s*\[x\]\s*/g, ''),
                    value: `\n_____\n## ✅ ~~${line.replace(/^\s*\[x\]\s*/g, '')}~~`,
                    index: null
                }
                nodes.push(node)
            }
            else if (!line.length) {
                node.value += `\n`
            }
            else {
                switch (status) {
                    case 'todo':
                    case 'none': {
                        node.value += `\n${line}`
                        break
                    }
                    case 'done': {
                        node.value += `\n~~${line}~~`
                        break
                    }
                }
            }
        }
        const description = nodes.find((v) => v.type === 'none')
        if (description) {
            append(`\n${description.value}`)
        }
        if (!descriptionOnly) {
            const indices = nodes.filter((v) => v.index !== null && v.type !== 'none')
            if (indices.length) {
                for (const index of indices.sort((x, y) => x.index! > y.index! ? 1 : y.index! > x.index! ? -1 : 0)) {
                    append(`\n${index.value}`)
                }
            }
            const todos = nodes.filter((v) => v.type === 'todo' && v.index === null)
            if (todos.length) {
                for (const todo of todos.sort((x, y) => (x.name || '') > (y.name || '') ? 1 : (y.name || '') > (x.name || '') ? -1 : 0)) {
                    append(`\n${todo.value}`)
                }
            }
            const dones = nodes.filter((v) => v.type === 'done' && v.index === null)
            if (dones.length) {
                for (const done of dones.sort((x, y) => (x.name || '') > (y.name || '') ? 1 : (y.name || '') > (x.name || '') ? -1 : 0)) {
                    append(`\n${done.value}`)
                }
            }
        }
        append('\n')
    }
    let upperCamelCaseKey = generateUpperCamelCaseKey(dir)
    let fileContent = `# ${baseDistPath === distPath ? 'Project root' : upperCamelCaseKey}\n`
    let fileContentRoot = fileContent
    let todos: string[] = []

    // Appends text to fileContent and fileContent2
    const append = (text: string) => {
        fileContent += text
        fileContentRoot += text
    }

    // Title
    if (dir.type === 'dir') {
        fs.mkdirSync(distPath, {
            recursive: true
        })
        if (dir.content) {
            const readme = dir.content['index.md'] || dir.content['readme.md']
            if (readme) {
                const contents = fs.readFileSync(path.join(docsPath, dir.content['index.md'] ? 'index.md' : 'readme.md')).toString('utf8')
                processFile(contents, false)
                // fileContent += contents
                // fileContentRoot += contents
            }
            else {
                fileContent += `No description available`
                fileContentRoot += `No description available`
                // todos.push('Add a description')
                // dir.total ++
                // dirs.forEach((dir) => {
                //     dir.total ++
                // })
            }
            append(`\n\n_____\n`)
            const generateTodoBadge = (text: string, size: 'h1'|'h2', dir: DirObject): string => {
                // Replace the first line if there's multiple lines
                if (/\r\n|\r|\n/g.test(text)) {
                    return text.split(/\r\n|\r|\n/)
                        .map((v, i) => i === 0
                            ? generateTodoBadge(v, size, dir)
                            : v
                        )
                        .join('\n')
                }
                
                // Otherwise append to string
                const backgroundColor = dir.done === dir.total
                    ? '#85FF17'
                    : dir.done === 0
                        ? '#FF1744'
                        : '#FFF117'
                const color = dir.done === dir.total
                    ? '#222222'
                    : dir.done === 0
                        ? '#FFFFFF'
                        : '#222222'
                const fontSize = (size === 'h1' ? 32 : 24) * 0.6
                const badge = dir.done === dir.total
                    ? 'Done'
                    : `${dir.done} <span style="font-size: ${fontSize * 1.5}px; vertical-align: middle; font-weight: 300;">/</span> ${dir.total + todos.length}`
                return `${text} <span style="background-color: ${backgroundColor}; color: ${color}; padding: 10px; border-radius: 100px; font-size: ${fontSize}px; vertical-align: top;">${badge}</span>`
            }
            
            // Loop through all the sub directories
            for (const entryName of Object.keys(dir.content)) {
                const subdir = dir.content[entryName]
                if (subdir.type === 'dir') {
                    buildDocs(subdir, [...dirs, dir])
                }
            }

            // Generate the top headers badge
            fileContent = generateTodoBadge(fileContent, 'h1', dir)
            fileContentRoot = generateTodoBadge(fileContentRoot, 'h1', dir)

            // Generate the badge for the docs header
            if (todos.length) {
                append(`\n\n${generateTodoBadge(`## TODO's`, 'h2', dir)}\n${todos.map((v) => `- ${v}`).join('\n')}\n______\n`)
            }

            // Add the sub directories
            const subdirs: DirObject[] = []
            Object.keys(dir.content).forEach((subdirName) => {
                subdirs.push(dir.content![subdirName])
            })
            for (const subdir of [
                ...subdirs.filter((v) => v.index !== null).sort((x, y) => x.index! > y.index! ? 1 : y.index! > x.index! ? -1 : 0),
                ...subdirs.filter((v) => v.index === null && v.done < v.total).sort((x, y) => x.done > y.done ? -1 : y.done > x.done ? 1 : x.segment > y.segment ? 1 : y.segment > x.segment ? -1 : 0),
                ...subdirs.filter((v) => v.index === null && v.done === v.total).sort((x, y) => x.segment > y.segment ? 1 : y.segment > x.segment ? -1 : 0)
            ].filter((v) => !['readme.md', 'index.md'].includes(v.segment))) {
                const tildes = subdir.total - subdir.done === 0
                    ? `~~`
                    : ''
                fileContent += `${generateTodoBadge(`## ${tildes}[${generateUpperCamelCaseKey(subdir)}](./${subdir.segment}/readme.md)${tildes}`, 'h2', subdir)}`
                fileContentRoot += `${generateTodoBadge(`## ${tildes}[${generateUpperCamelCaseKey(subdir)}](./dist/${subdir.segment}/readme.md)${tildes}`, 'h2', subdir)}`
                const _path = fs.existsSync(path.join(subdir.path, 'readme.md'))
                    ? path.join(subdir.path, 'readme.md')
                    : fs.existsSync(path.join(subdir.path, 'índex.md'))
                        ? path.join(subdir.path, 'índex.md')
                        : null
                if (_path) {
                    const file = fs.readFileSync(_path).toString('utf8')
                    processFile(file, true)
                }
                append(`\n_____\n`)
            }
            
            // Add the support us line
            append(`You can support us [here](https://www.buymeacoffee.com/hurx), if you like the language!`)
            
            // Go back button
            if (baseDistPath !== distPath) {
                fileContent += `\n_____\n[Go back](../readme.md#${generateUpperCamelCaseKey(dir).replace(/\s/g, '-')})`
            }

            // Write the regular file
            fs.writeFileSync(path.join(distPath, 'readme.md'), `${fileContent}`)
            
            // Write the index file
            if (baseDistPath === distPath) {
                fs.writeFileSync(path.join(basePath, 'readme.md'), `${fileContentRoot}`)
            }
        }
    }
}
buildDocs(readdir(path.join(__dirname, '../docs')))