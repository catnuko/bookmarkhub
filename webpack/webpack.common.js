const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const srcDir = path.join(__dirname, '..', 'src')

module.exports = {
	entry: {
		popup: path.join(srcDir, 'popup.tsx'),
		options: path.join(srcDir, 'options.tsx'),
		background: path.join(srcDir, 'background.ts'),
		content_script: path.join(srcDir, 'content_script.tsx'),
	},
	output: {
		path: path.join(__dirname, '../dist/js'),
		filename: '[name].js',
	},
	optimization: {
		splitChunks: {
			name: 'vendor',
			chunks(chunk) {
				return chunk.name !== 'background'
			},
		},
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									[
										'postcss-preset-env',
										{
											// 其他选项
										},
									],
								],
							},
						},
					},
				],
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: {
					loader: 'url-loader',
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
		alias: {
			'@': path.resolve(__dirname, '../src/'),
		},
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: '.', to: '../', context: 'public' }],
			options: {},
		}),
	],
}
